from typing import Final


# Raw AGMARKNET variety → canonical variety
#
# Keep this mapping conservative.
# Only aliases that we have high confidence about
# should be normalized.
VARIETY_ALIASES: Final[dict[str, str]] = {
    "I.R.-64": "I.R. 64",
}


def normalize_variety(variety: str) -> str:
    """
    Convert a raw AGMARKNET variety name into its
    canonical analytical name.
    """
    return VARIETY_ALIASES.get(
        variety,
        variety,
    )


def raw_varieties_for_canonical(
    canonical_variety: str,
) -> list[str]:
    """
    Return all raw AGMARKNET variety names that map
    to a given canonical variety.

    Example:
        I.R. 64
        -> ["I.R. 64", "I.R.-64"]
    """

    raw_names = [
        raw
        for raw, canonical in VARIETY_ALIASES.items()
        if canonical == canonical_variety
    ]

    if canonical_variety not in raw_names:
        raw_names.append(canonical_variety)

    return raw_names
