"""CRUD routes for patient_mgmt.appointment"""
from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

appointment_bp = Blueprint("appointments", __name__)

@appointment_bp.route("/api/appointments", methods=["GET"])
def get_all():
    conn = None
    try:
        doctor_id = request.args.get('doctor_id')
        
        query = """
                    SELECT 
                        a.app_id,
                        p.patient_name,
                        d.doctor_name,
                        dept.dept_name,
                        a.app_date,
                        a.status
                    FROM patient_mgmt.appointment a
                    LEFT JOIN patient_mgmt.patient p 
                        ON a.patient_id = p.patient_id
                    LEFT JOIN staff_mgmt.doctor d 
                        ON a.doctor_id = d.doctor_id
                    LEFT JOIN staff_mgmt.department dept 
                        ON d.dept_id = dept.dept_id
                    WHERE 1=1
                """
        params = []
        if doctor_id:
            query += " AND a.doctor_id = %s"
            params.append(doctor_id)
            
        query += " ORDER BY a.app_id;"
        
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

@appointment_bp.route("/api/appointments/<int:appointment_id>", methods=["GET"])
def get_one(appointment_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM patient_mgmt.appointment WHERE app_id = %s;", (appointment_id,))
        row = cur.fetchone()
        cur.close()
        if not row: return jsonify({"error": "Not found"}), 404
        return jsonify(row), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)

@appointment_bp.route("/api/appointments", methods=["POST"])
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
        cur.execute(f"INSERT INTO patient_mgmt.appointment ({cols}) VALUES ({vals}) RETURNING *;", [data[k] for k in keys])
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(obj), 201
    except Exception as e:
        if conn: conn.rollback()
        err_msg = str(e)
        if hasattr(e, 'pgcode') and e.pgcode == '23503':
            err_msg = "Validation Error: Invalid patient_id or doctor_id. Record not found."
        return jsonify({"error": err_msg}), 400
    finally: release_connection(conn)

@appointment_bp.route("/api/appointments/<int:appointment_id>", methods=["PUT"])
def update(appointment_id):
    conn = None
    try:
        data = request.get_json()
        if not data: return jsonify({"error": "No data provided"}), 400
        keys = [k for k in data.keys() if k.isidentifier()]
        set_clause = ", ".join([f"{k} = %s" for k in keys])
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        values = [data[k] for k in keys] + [appointment_id]
        cur.execute(f"""
                    UPDATE patient_mgmt.appointment 
                    SET {set_clause} 
                    WHERE app_id = %s 
                    RETURNING *;
                """, values)
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify(obj), 200
    except Exception as e:
        if conn: conn.rollback()
        err_msg = str(e)
        if hasattr(e, 'pgcode') and e.pgcode == '23503':
            err_msg = "Validation Error: Invalid patient_id or doctor_id. Record not found."
        return jsonify({"error": err_msg}), 400
    finally: release_connection(conn)

@appointment_bp.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete(appointment_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("DELETE FROM patient_mgmt.appointment WHERE app_id = %s RETURNING *;", (appointment_id,))
        obj = cur.fetchone()
        conn.commit()
        cur.close()
        if not obj: return jsonify({"error": "Not found"}), 404
        return jsonify({"message": "Deleted successfully", "data": obj}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally: release_connection(conn)
