"""CRUD routes for billing_mgmt.service_taken"""
from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

service_taken_bp = Blueprint("services_taken", __name__)

@service_taken_bp.route("/api/services_taken", methods=["GET"])
def get_all():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM billing_mgmt.service_taken ORDER BY service_taken_id;")
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)

@service_taken_bp.route("/api/services_taken/<int:service_taken_id>", methods=["GET"])
def get_one(service_taken_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM billing_mgmt.service_taken WHERE service_taken_id = %s;", (service_taken_id,))
        row = cur.fetchone()
        cur.close()
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@service_taken_bp.route("/api/services_taken", methods=["POST"])
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
        cur.execute(f"INSERT INTO billing_mgmt.service_taken ({cols}) VALUES ({vals}) RETURNING *;", [data[k] for k in keys])
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(obj), 201
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@service_taken_bp.route("/api/services_taken/<int:service_taken_id>", methods=["PUT"])
def update(service_taken_id):
    conn = None
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data provided"}), 400
        keys = [k for k in data.keys() if k.isidentifier()]
        set_clause = ", ".join([f"{k} = %s" for k in keys])
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        values = [data[k] for k in keys] + [service_taken_id]
        cur.execute(f"UPDATE billing_mgmt.service_taken SET {set_clause} WHERE service_taken_id = %s RETURNING *;", values)
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify(obj), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@service_taken_bp.route("/api/services_taken/<int:service_taken_id>", methods=["DELETE"])
def delete(service_taken_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("DELETE FROM billing_mgmt.service_taken WHERE service_taken_id = %s RETURNING *;", (service_taken_id,))
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Deleted successfully", "data": obj}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)
