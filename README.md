# Bilart

**Bilart** is an online art community platform that allows people of all levels of artistic interest to connect and share their passion for art. The platform provides a virtual space where artists can create profiles, upload their artwork, set prices, and specify auction durations. Collectors and art enthusiasts can explore a diverse collection of art, discover new artists, and participate in secure online auctions.

This project was the capstone for our database course, and I was responsible for the backend.

## Technologies Used

- **Backend Framework:** FastAPI (Python)
  - Chosen for its high-speed performance and compatibility with Python, which offers high readability and writability.
- **Database:** PostgreSQL
- **Programming Language:** Python

## Backend Architecture

The backend is composed of seventeen modules, each corresponding to a respective database table. These modules generally contain the following components:

- **`model.py`**: Represents the table itself, containing table names, creation methods, and table identifiers.
- **`router.py`**: Provides CRUD and more specific endpoints necessary for the client to interact with the application.
- **`trigger.py`**: Facilitates functionality by providing necessary constraints and performance enhancements.
- **`view.py`**: Provides additional views for optimized data retrieval.

### SQL Query Helpers

- **`params_to_where_clause(**kwargs)`**: Converts keyword arguments (kwargs) into a SQL WHERE clause, supporting filters like equality, greater than, less than, not equal, and LIKE search queries. It also handles NULL values and allows specifying columns from different tables.

- **`natural_join_models(models: list[ModelProtocal]) -> str`**: Generates a SQL query string to perform a natural join on the provided list of models.

- **`class JoinModel`**: Represents a model for joining tables, including the table (`model`), the column (`on`) on which the join is based, and the type of join (`join_type`, defaulting to "INNER JOIN").

- **`join_models(models: list[JoinModel]) -> str`**: Creates a SQL string to join the specified tables based on each `JoinModel` instance.

- **`get_from_table(...)`**: Constructs and executes a SQL query based on inputs such as table names, WHERE clause, ORDER BY clause, and a selection function. It handles whether a single record is expected and returns the result or an appropriate HTTP exception.

- **`retrieve(...)`**: A higher-level abstraction for fetching data, utilizing `get_from_table` to perform data retrieval by constructing necessary SQL clauses from the provided arguments.

Each function and class is designed to abstract and simplify the process of constructing and executing SQL queries, particularly for operations involving joins and complex WHERE clauses. The code is tailored for use with a PostgreSQL database, utilizing the `PgDatabase` context manager.

### Constraints

We enforce constraints with various table creation methods to ensure data integrity and performance optimization.


