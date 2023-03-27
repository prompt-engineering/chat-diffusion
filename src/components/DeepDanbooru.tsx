import { DeepDanbooruTag } from "@/utils/type.util";
import { ChangeEventHandler, useEffect, useState } from "react";
type DeepDanbooruProps = {
  dict: Record<string, string>;
  tags: DeepDanbooruTag[];
  handleTagSelectedChange?: (tags: string[]) => void;
  clearSelectedFlag: number;
};

export function DeepDanbooru(props: DeepDanbooruProps) {
  const [tagSelected, setTagSelected] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [allSelected, setAllSelected] = useState<boolean>(false);
  const handleTagSelectedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    tagSelected[e.target.name] = e.target.checked;
    setTagSelected(tagSelected);
    let selected = 0;
    for (const tag in tagSelected) if (tagSelected[tag]) selected++;
    console.log(
      selected,
      props.tags.filter((t) => t.label.indexOf("rating") == -1).length
    );
    if (
      selected ==
      props.tags.filter((t) => t.label.indexOf("rating") == -1).length
    ) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
    if (props.handleTagSelectedChange)
      props.handleTagSelectedChange(
        Object.keys(tagSelected).filter((t) => tagSelected[t])
      );
  };
  const handleTagSelectAllChange: ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    for (const i in props.tags) {
      if (props.tags[i].label.indexOf("rating") != -1) continue;
      tagSelected[props.tags[i].label] = e.target.checked;
    }
    setTagSelected(tagSelected);
    setAllSelected(e.target.checked);
    if (props.handleTagSelectedChange)
      props.handleTagSelectedChange(
        Object.keys(tagSelected).filter((t) => tagSelected[t])
      );
  };
  useEffect(() => {
    if (props.clearSelectedFlag) {
      for (const i in props.tags) {
        if (props.tags[i].label.indexOf("rating") != -1) continue;
        tagSelected[props.tags[i].label] = false;
      }
      setTagSelected(tagSelected);
      setAllSelected(false);
    }
  }, [props.clearSelectedFlag]);
  return (
    <>
      {props &&
        props.tags.map((tag) => {
          if (tag.label.indexOf("rating") != -1) return;
          if (tagSelected[tag.label] == undefined)
            tagSelected[tag.label] = false;
          return (
            <div
              style={{
                position: "relative",
                borderBottom: "1px dashed #ccc",
                padding: "0.5rem 0",
              }}
              key={tag.label}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "5px",
                  overflow: "hidden",
                  borderRadius: "4px",
                  background: "lightgrey",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "0",
                    top: "0",
                    width: tag.confidence * 100 + "%",
                    height: "5px",
                    borderRadius: "4px",
                    background: "orange",
                  }}
                ></div>
              </div>
              <input
                type="checkbox"
                name={tag.label}
                onChange={handleTagSelectedChange}
                checked={tagSelected[tag.label]}
                style={{ margin: "0 0.5rem 0 0" }}
              />
              <label
                style={{
                  paddingRight: "4rem",
                }}
              >
                {tag.label}
                <span
                  style={{ position: "absolute", right: 0, bottom: "0.5rem" }}
                >
                  {Math.round(tag.confidence * 1000) / 10}%
                </span>
              </label>
            </div>
          );
        })}
      {props && props.tags.length && (
        <>
          <input
            type="checkbox"
            name="select_all"
            onChange={handleTagSelectAllChange}
            style={{ margin: "1rem 0.5rem 0.5rem 0" }}
            checked={allSelected}
          />
          <label
            style={{
              paddingRight: "4rem",
            }}
          >
            {props.dict["select_all"]}
          </label>
        </>
      )}
    </>
  );
}
