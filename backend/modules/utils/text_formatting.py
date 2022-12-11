import re

_TEXT_COLOR_MAPPING = {
    "blue": "36;1",
    "yellow": "33;1",
    "pink": "38;5;200",
    "green": "32;1",
}

"""
def print_text(text: str, color: Optional[str] = None, end: str = "") -> None:
    if color is None:
        print(text, end=end)
    else:
        color_str = _TEXT_COLOR_MAPPING[color]
        print(f"\u001b[{color_str}m\033[1;3m{text}\u001b[0m", end=end)
"""

COLOR_TO_STYLE = {
    "pink": "```",
    "yellow": "```",
    "green": "```",
    "blue": "__",
}


def colored_text_to_md(text: str):
    # find "\u001b[{color_str}m\033[1;3m{text}\u001b[0m"
    # replace with "{COLOR_TO_STYLE[color]}{text}{COLOR_TO_STYLE[color]}"

    # with open("test.txt", "w") as f:
    #    f.write(text)
    return re.sub(r'\x1b\[[0-9;]*m', '', text)
    text = text.replace("\n", "\\n")
    for color in COLOR_TO_STYLE:
        style = COLOR_TO_STYLE[color]
        color_str = _TEXT_COLOR_MAPPING[color]
        text = re.sub(
            f"\u001b\[{color_str}m\033\[1;3m(.*?)\u001b\[0m", f"{style}\\1{style}", text)
    # bold
    text = re.sub("\033\[1m(.*?)\033\[0m", "**\\1**", text)

    # replace \\ with \
    text = text.replace("\\n", "\n")
    return text


if __name__ == "__main__":
    with open("../../../test.txt", "r") as f:
        text = f.read()
        print(colored_text_to_md(text))
