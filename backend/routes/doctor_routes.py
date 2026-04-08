"""
CRUD routes for staff_mgmt.doctor table.
"""

from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

doctor_bp = Blueprint("doctors", __name__)

@doctor_bp.route("/api/doctors", methods=["GET"])
def get_all_doctors():
    conn = None
    try:
        dept_id = request.args.get('department_id') or request.args.get('dept_id')
        
        query = """
            SELECT d.*, dept.dept_name AS department_name
            FROM staff_mgmt.doctor d
            LEFT JOIN staff_mgmt.department dept ON d.dept_id = dept.dept_id
            WHERE 1=1
        """
        params = []
        if dept_id:
            query += " AND d.dept_id = %s"
            params.append(dept_id)
            
        query += " ORDER BY d.doctor_id;"
        
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


@doctor_bp.route("/api/doctors/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM staff_mgmt.doctor WHERE doctor_id = %s;", (doctor_id,))
        row = cur.fetchone()
        cur.close()
        if row is None:
            return jsonify({"error": "Doctor not found"}), 404
        return jsonify(row), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@doctor_bp.route("/api/doctors", methods=["POST"])
def create_doctor():
    conn = None
    try:
        data = request.get_json()
        if not data or "name" not in data or "dept_id" not in data:
            return jsonify({"error": "name and dept_id are required"}), 400

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """INSERT INTO staff_mgmt.doctor 
            (doctor_name, specialization, phoneno, dept_id, licenseno)
            VALUES (%s, %s, %s, %s, %s) RETURNING *;""",
            (
                data["name"],
                data.get("specialization"),
                data.get("phone"),
                data["dept_id"],
                data.get("license_no")   # 👈 frontend key
            )
        )
        new_doctor = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(new_doctor), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@doctor_bp.route("/api/doctors/<int:doctor_id>", methods=["PUT"])
def update_doctor(doctor_id):
    conn = None
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        fields = []
        values = []

        if "name" in data:
            fields.append("doctor_name = %s")
            values.append(data["name"])

        if "specialization" in data:
            fields.append("specialization = %s")
            values.append(data["specialization"])

        if "phone" in data:
            fields.append("phoneno = %s")
            values.append(data["phone"])

        if "license_no" in data:
            fields.append("licenseno = %s")
            values.append(data["license_no"])

        if "dept_id" in data:
            fields.append("dept_id = %s")
            values.append(data["dept_id"])

        if not fields:
            return jsonify({"error": "No fields to update"}), 400

        values.append(doctor_id)

        query = f"""
            UPDATE staff_mgmt.doctor
            SET {', '.join(fields)}
            WHERE doctor_id = %s
            RETURNING *;
        """

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, tuple(values))
        updated = cur.fetchone()
        conn.commit()
        cur.close()

        if updated is None:
            return jsonify({"error": "Doctor not found"}), 404

        return jsonify(updated), 200

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


@doctor_bp.route("/api/doctors/<int:doctor_id>", methods=["DELETE"])
def delete_doctor(doctor_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("DELETE FROM staff_mgmt.doctor WHERE doctor_id = %s RETURNING *;", (doctor_id,))
        deleted = cur.fetchone()
        conn.commit()
        cur.close()
        if deleted is None:
            return jsonify({"error": "Doctor not found"}), 404
        return jsonify({"message": "Doctor deleted", "doctor": deleted}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)
