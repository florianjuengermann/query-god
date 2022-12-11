from typing import Callable, NamedTuple, Optional, List


class Resource(NamedTuple):
    """Interface for resources."""

    type: str
    name: str
    #func: Callable[[str], str]
    description: Optional[str] = None


def format_resources(resources: List[Resource]) -> str:
    """Format the resources into a string."""
    return "\n".join(
        [
            f"{r.type}: '{r.name}' {r.description}"
            for r in resources
            if r.description
        ]
    )
