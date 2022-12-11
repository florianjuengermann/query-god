from typing import Callable, NamedTuple, Optional, List


class Resource(NamedTuple):
    """Interface for resources."""

    type: str
    #func: Callable[[str], str]
    description: Optional[str] = None


def format_resources(resources: List[Resource]) -> str:
    """Format the resources into a string."""
    return "\n".join(
        [
            f"{resource.description}"
            for resource in resources
            if resource.description
        ]
    )
