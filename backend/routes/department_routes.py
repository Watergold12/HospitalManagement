"""
CRUD routes for staff_mgmt.department table.
Phase 1 — only this table is implemented.
"""

from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from database.db import get_connection, release_connection

department_bp = Blueprint("departments", __name__)


# ──────────────────────────────────────────────
# GET /api/departments  →  List all departments
# ──────────────────────────────────────────────
@department_bp.route("/api/departments", methods=["GET"])
def get_all_departments():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM staff_mgmt.department ORDER BY dept_id;")
        rows = cur.fetchall()
        cur.close()
        return jsonify(rows), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


# ──────────────────────────────────────────────
# GET /api/departments/<id>  →  Get one department
# ──────────────────────────────────────────────
@department_bp.route("/api/departments/<int:dept_id>", methods=["GET"])
def get_department(dept_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM staff_mgmt.department WHERE dept_id = %s;", (dept_id,))
        row = cur.fetchone()
        cur.close()
        if row is None:
            return jsonify({"error": "Department not found"}), 404
        return jsonify(row), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


# ──────────────────────────────────────────────
# POST /api/departments  →  Add a new department
# ──────────────────────────────────────────────
@department_bp.route("/api/departments", methods=["POST"])
def create_department():
    conn = None
    try:
        data = request.get_json()

        # Validation
        if not data or "dept_name" not in data:
            return jsonify({"error": "dept_name is required"}), 400

        dept_name = data["dept_name"]
        location = data.get("location", None)

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """INSERT INTO staff_mgmt.department (dept_name, location)
               VALUES (%s, %s) RETURNING *;""",
            (dept_name, location)
        )
        new_dept = cur.fetchone()
        conn.commit()
        cur.close()
        return jsonify(new_dept), 201
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


# ──────────────────────────────────────────────
# PUT /api/departments/<id>  →  Update a department
# ──────────────────────────────────────────────
@department_bp.route("/api/departments/<int:dept_id>", methods=["PUT"])
def update_department(dept_id):
    conn = None
    try:
        data = request.get_json()

        if not data or "dept_name" not in data:
            return jsonify({"error": "dept_name is required"}), 400

        dept_name = data["dept_name"]
        location = data.get("location", None)

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """UPDATE staff_mgmt.department
               SET dept_name = %s, location = %s
               WHERE dept_id = %s RETURNING *;""",
            (dept_name, location, dept_id)
        )
        updated = cur.fetchone()
        conn.commit()
        cur.close()

        if updated is None:
            return jsonify({"error": "Department not found"}), 404
        return jsonify(updated), 200
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        release_connection(conn)


# ──────────────────────────────────────────────
# DELETE /api/departments/<id>  →  Delete a department
# ──────────────────────────────────────────────
@department_bp.route("/api/departments/<int:dept_id>", methods=["DELETE"])
def delete_department(dept_id):
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "DELETE FROM staff_mgmt.department WHERE dept_id = %s RETURNING *;",
            (dept_id,)
        )
        deleted = cur.fetchone()
        conn.commit()
        cur.close()

        if deleted is None:
            return jsonify({"error": "Department not found"}), 404
        return jsonify({"message": "Department deleted", "department": deleted}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        err_msg = str(e)
        if hasattr(e, 'pgcode') and e.pgcode == '23503':
            err_msg = "Validation Error: Cannot delete department because dependent staff (doctors/nurses) still exist."
        return jsonify({"error": err_msg}), 400
    finally:
        release_connection(conn)
