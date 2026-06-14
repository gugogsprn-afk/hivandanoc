"""Build offline embed scripts (no Node.js required)."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main() -> None:
    hospital = json.loads((ROOT / "data" / "hospital.json").read_text(encoding="utf-8"))
    (ROOT / "data" / "hospital.embed.js").write_text(
        "window.__HOSPITAL_BASE__=" + json.dumps(hospital, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print("Wrote data/hospital.embed.js")

    for code in ("hy", "ru", "en"):
        data = json.loads((ROOT / "lang" / f"{code}.json").read_text(encoding="utf-8"))
        (ROOT / "lang" / f"{code}.embed.js").write_text(
            "window.__I18N__=window.__I18N__||{};"
            f"window.__I18N__['{code}']="
            + json.dumps(data, ensure_ascii=False)
            + ";\n",
            encoding="utf-8",
        )
        print(f"Wrote lang/{code}.embed.js")

    print("Done.")


if __name__ == "__main__":
    main()
