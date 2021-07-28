import json
from pathlib import Path

from irahorecka.api import AREA_KEY, NEIGHBORHOODS

DOCS_PATH = Path(__file__).absolute().parent.joinpath("docs.json")
SCORE_COLORS = {
    "very-poor": "bg-red-400",
    "poor": "bg-red-300",
    "mild-poor": "bg-red-200",
    "neutral": "bg-white",
    "mild-good": "bg-green-200",
    "good": "bg-green-300",
    "very-good": "bg-green-400",
}


def get_area_key(key):
    """Returns area key read from key provided by caller. Default to empty
    string if key not found."""
    return AREA_KEY.get(key, "")


def get_neighborhoods(key):
    """Returns an iterable of neighborhoods from key provided by caller."""
    return NEIGHBORHOODS.get(key, tuple())


def get_score_color(score):
    """Gets score color from score provided by caller."""
    if score == 0.0:
        return SCORE_COLORS["neutral"]
    if score >= 80:
        return SCORE_COLORS["very-good"]
    if score >= 40:
        return SCORE_COLORS["good"]
    if score >= 0.0:
        return SCORE_COLORS["mild-good"]
    if score <= -80:
        return SCORE_COLORS["very-poor"]
    if score <= -40:
        return SCORE_COLORS["poor"]
    if score <= 0.0:
        return SCORE_COLORS["mild-poor"]


def parse_req_form(request_form):
    """Parses request form provided by caller and returns parameters dict."""
    params = {key: value.lower() for key, value in request_form.items() if value and value not in ["-"]}
    if params.get("area"):
        params["area"] = get_area_key(params["area"])
    return params


def read_docs():
    """Returns `neighborhoods.json` as dictionary."""
    with open(DOCS_PATH) as file:
        docs = json.load(file)
    return docs


def tidy_posts(posts):
    """Tidies an iterable of posts provided by caller. Currently the only tidiness is
    adding score color key based on the provided score."""
    for post in posts:
        post["score_color"] = get_score_color(post["score"])
    return posts