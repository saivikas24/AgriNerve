
"""add user verification and consent fields

Revision ID: 37105d511c33
Revises: a4b7363e21ba
Create Date: 2026-08-26 23:54:31.613129
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "37105d511c33"
down_revision: Union[str, Sequence[str], None] = "a4b7363e21ba"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "mobile_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "consent_given_at",
            sa.DateTime(),
            nullable=True,
        ),
    )

    # Existing rows have been safely initialized to False.
    # Remove the database-level defaults so future values are
    # controlled by the application/model.
    op.alter_column(
        "users",
        "mobile_verified",
        server_default=None,
    )

    op.alter_column(
        "users",
        "email_verified",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("users", "consent_given_at")
    op.drop_column("users", "email_verified")
    op.drop_column("users", "mobile_verified")
