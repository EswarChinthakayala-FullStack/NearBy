import code
import typer
from rich.console import Console

console = Console()


def shell_command():
    """Start an interactive Python shell with ORM models, DB session, and settings pre-loaded."""
    console.print("[bold cyan]Starting interactive Python REPL with backend models pre-loaded...[/bold cyan]\n")

    from app.core.config import settings
    from app.crud.crud_place import crud_place
    from app.crud.crud_user import crud_user
    from app.db.session import AsyncSessionFactory
    from app.models.category import Category
    from app.models.place import Place
    from app.models.user import User

    local_vars = {
        "settings": settings,
        "User": User,
        "Place": Place,
        "Category": Category,
        "crud_user": crud_user,
        "crud_place": crud_place,
        "AsyncSessionFactory": AsyncSessionFactory
    }

    banner = (
        "Available context variables:\n"
        "  - settings\n"
        "  - User, Place, Category\n"
        "  - crud_user, crud_place\n"
        "  - AsyncSessionFactory\n"
    )

    code.interact(banner=banner, local=local_vars)
