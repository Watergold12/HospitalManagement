"""CRUD routes for patient_mgmt.prescription"""
from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

prescription_bp = Blueprint("prescriptions", __name__)

@prescription_bp.route("/api/prescriptions", methods=["GET"])
def get_all():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM patient_mgmt.prescription ORDER BY prescription_id;")
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)

@prescription_bp.route("/api/prescriptions/<int:prescription_id>", methods=["GET"])
def get_one(prescription_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM patient_mgmt.prescription WHERE prescription_id = %s;", (prescription_id,))
        row = cur.fetchone()
        cur.close()
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@prescription_bp.route("/api/prescriptions", methods=["POST"])
def create():
    conn = None
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data provided"}), 400
        keys = [k for k in data.keys() if k.isidentifier()]
        cols = ", ".join(keys)
        vals = ", ".join(["%s"] * len(keys))
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(f"INSERT INTO patient_mgmt.prescription ({cols}) VALUES ({vals}) RETURNING *;", [data[k] for k in keys])
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(obj), 201
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@prescription_bp.route("/api/prescriptions/<int:prescription_id>", methods=["PUT"])
def update(prescription_id):
    conn = None
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data provided"}), 400
        keys = [k for k in data.keys() if k.isidentifier()]
        set_clause = ", ".join([f"{k} = %s" for k in keys])
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        values = [data[k] for k in keys] + [prescription_id]
        cur.execute(f"UPDATE patient_mgmt.prescription SET {set_clause} WHERE prescription_id = %s RETURNING *;", values)
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify(obj), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@prescription_bp.route("/api/prescriptions/<int:prescription_id>", methods=["DELETE"])
def delete(prescription_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("DELETE FROM patient_mgmt.prescription WHERE prescription_id = %s RETURNING *;", (prescription_id,))
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Deleted successfully", "data": obj}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)
