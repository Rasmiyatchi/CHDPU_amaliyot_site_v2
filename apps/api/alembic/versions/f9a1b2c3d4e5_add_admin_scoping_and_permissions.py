"""add faculty_id and permissions to users for admin scoping

Revision ID: f9a1b2c3d4e5
Revises: f8c9d0e1a2b3
Create Date: 2026-09-27
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "f9a1b2c3d4e5"
down_revision: str | Sequence[str] | None = "f8c9d0e1a2b3"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "faculty_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("faculties.id", ondelete="SET NULL"),
            nullable=True,
            comment="Fakultet bo'yicha cheklov",
        ),
    )
    op.create_index(
        op.f("ix_users_faculty_id"),
        "users",
        ["faculty_id"],
    )
    op.add_column(
        "users",
        sa.Column(
            "permissions",
            sa.ARRAY(sa.String(length=64)),
            nullable=False,
            server_default="{}",
            comment="Admin funksional ruxsatlari",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "permissions")
    op.drop_index(op.f("ix_users_faculty_id"), table_name="users")
    op.drop_column("users", "faculty_id")
