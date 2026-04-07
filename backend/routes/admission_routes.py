"""CRUD routes for patient_mgmt.admission"""
from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

admission_bp = Blueprint("admissions", __name__)

@admission_bp.route("/api/admissions", methods=["GET"])
def get_all():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM patient_mgmt.admission ORDER BY admission_id;")
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)

@admission_bp.route("/api/admissions/<int:admission_id>", methods=["GET"])
def get_one(admission_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM patient_mgmt.admission WHERE admission_id = %s;", (admission_id,))
        row = cur.fetchone()
        cur.close()
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@admission_bp.route("/api/admissions", methods=["POST"])
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
        cur.execute(f"INSERT INTO patient_mgmt.admission ({cols}) VALUES ({vals}) RETURNING *;", [data[k] for k in keys])
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(obj), 201
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@admission_bp.route("/api/admissions/<int:admission_id>", methods=["PUT"])
def update(admission_id):
    conn = None
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data provided"}), 400
        keys = [k for k in data.keys() if k.isidentifier()]
        set_clause = ", ".join([f"{k} = %s" for k in keys])
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        values = [data[k] for k in keys] + [admission_id]
        cur.execute(f"UPDATE patient_mgmt.admission SET {set_clause} WHERE admission_id = %s RETURNING *;", values)
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify(obj), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@admission_bp.route("/api/admissions/<int:admission_id>", methods=["DELETE"])
def delete(admission_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("DELETE FROM patient_mgmt.admission WHERE admission_id = %s RETURNING *;", (admission_id,))
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Deleted successfully", "data": obj}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)
