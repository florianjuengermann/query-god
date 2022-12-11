from typing import Callable, NamedTuple, Optional, List


class API(NamedTuple):
    """Interface for api."""

    type: str
    #func: Callable[[str], str]
    signature: str
    description: Optional[str] = None


def format_apis(apis: List[API]) -> str:
    """Format the apis into a string."""
    return "\n".join(
        [
            f"{api.type}: {api.signature}: {api.description}"
            for api in apis
            if api.description
        ]
    )
