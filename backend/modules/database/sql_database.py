# Source: langchain.SQLDatabase
"""SQLAlchemy wrapper around a database."""
from __future__ import annotations

from typing import Any, Iterable, List, Optional

from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import Engine


class SQLDatabase:
    """SQLAlchemy wrapper around a database."""

    def __init__(
        self,
        engine: Engine,
        ignore_tables: Optional[List[str]] = None,
        include_tables: Optional[List[str]] = None,
    ):
        """Create engine from database URI."""
        self._engine = engine
        if include_tables and ignore_tables:
            raise ValueError(
                "Cannot specify both include_tables and ignore_tables")

        self._inspector = inspect(self._engine)
        self._all_tables = self._inspector.get_table_names()
        self._include_tables = include_tables or []
        if self._include_tables:
            missing_tables = set(
                self._include_tables).difference(self._all_tables)
            if missing_tables:
                raise ValueError(
                    f"include_tables {missing_tables} not found in database"
                )
        self._ignore_tables = ignore_tables or []
        if self._ignore_tables:
            missing_tables = set(
                self._ignore_tables).difference(self._all_tables)
            if missing_tables:
                raise ValueError(
                    f"ignore_tables {missing_tables} not found in database"
                )

    @classmethod
    def from_uri(cls, database_uri: str, **kwargs: Any) -> SQLDatabase:
        """Construct a SQLAlchemy engine from URI."""
        return cls(create_engine(database_uri), **kwargs)

    @property
    def dialect(self) -> str:
        """Return string representation of dialect to use."""
        return self._engine.dialect.name

    def _get_table_names(self) -> Iterable[str]:
        if self._include_tables:
            return self._include_tables
        return set(self._all_tables) - set(self._ignore_tables)

    @property
    def table_info(self) -> str:
        """Information about all tables in the database."""
        template = "Table '{table_name}' has columns: {columns}."
        tables = []
        for table_name in self._get_table_names():
            columns = []
            for column in self._inspector.get_columns(table_name):
                # TODO find unique/example values and input them here
                # for now it's only for the status column
                if column["name"] == "status":
                    columns.append(
                        f"{column['name']} ('success', 'training', 'failure')")
                else:
                    columns.append(f"{column['name']} ({str(column['type'])})")
                # ouput some unique values
            column_str = ", ".join(columns)
            table_str = template.format(
                table_name=table_name, columns=column_str)
            tables.append(table_str)
        return "\n".join(tables)

    def run(self, command: str) -> tuple[str, list[dict]]:
        """Execute a SQL command and return a string representing the results.

        If the statement returns rows, a string of the results is returned.
        If the statement returns no rows, an empty string is returned.
        """
        with self._engine.connect() as connection:
            #cursor = connection.exec_driver_sql(command)
            try:
                command = command.replace("%", "%%")  # python format
                cursor = connection.execute(command)
                if cursor.returns_rows:
                    result = cursor.fetchall()
                    # to json
                    json_result = [dict(row) for row in result]
                    return (None, json_result)
            except Exception as e:
                print(e)
                return (e.__str__(), [])
        return ("", [])
