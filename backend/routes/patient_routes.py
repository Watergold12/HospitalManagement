"""CRUD routes for patient_mgmt.patient"""
from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

patient_bp = Blueprint("patients", __name__)

@patient_bp.route("/api/patients", methods=["GET"])
def get_all():
    conn = None
    try:
        name_filter = request.args.get('name')
        
        query = "SELECT * FROM patient_mgmt.patient WHERE 1=1"
        params = []
        if name_filter:
            query += " AND name ILIKE %s"
            params.append(f"%{name_filter}%")
            
        query += " ORDER BY patient_id;"
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)

@patient_bp.route("/api/patients/<int:patient_id>", methods=["GET"])
def get_one(patient_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM patient_mgmt.patient WHERE patient_id = %s;", (patient_id,))
        row = cur.fetchone()
        cur.close()
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@patient_bp.route("/api/patients", methods=["POST"])
def create():
    conn = None
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data provided"}), 400
        # mapping frontend → database
        field_map = {
            "name": "patient_name",
            "phone": "phoneno",
            # add more if needed
        }

        cols_list = []
        values = []

        for key in data:
            if key in field_map:
                cols_list.append(field_map[key])
                values.append(data[key])

        cols = ", ".join(cols_list)
        vals = ", ".join(["%s"] * len(cols_list))
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            f"INSERT INTO patient_mgmt.patient ({cols}) VALUES ({vals}) RETURNING *;",
            values
        )
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(obj), 201
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@patient_bp.route("/api/patients/<int:patient_id>", methods=["PUT"])
def update(patient_id):
    conn = None
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data provided"}), 400
        keys = [k for k in data.keys() if k.isidentifier()]
        set_clause = ", ".join([f"{k} = %s" for k in keys])
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        values = [data[k] for k in keys] + [patient_id]
        cur.execute(f"UPDATE patient_mgmt.patient SET {set_clause} WHERE patient_id = %s RETURNING *;", values)
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify(obj), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@patient_bp.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete(patient_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("DELETE FROM patient_mgmt.patient WHERE patient_id = %s RETURNING *;", (patient_id,))
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Deleted successfully", "data": obj}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)
