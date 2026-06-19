import { __ } from "@wordpress/i18n";
import {
  InnerBlocks,
  useBlockProps,
  InspectorControls,
  PanelColorSettings,
} from "@wordpress/block-editor";
import type { BlockEditProps } from "@wordpress/blocks";
import type { CSSProperties } from "react";
import type { BlockTemplate } from "../../types/wordpress";
import "./editor.scss";

export type HeaderAttributes = {
  backgroundColor: string;
  textColor: string;
};

const TEMPLATE: BlockTemplate[] = [
  [
    "core/columns",
    {
      className: "header-layout",
      isStackedOnMobile: false,
      style: { spacing: { blockGap: "2rem", margin: "0", padding: "0" } },
    },
    [
      [
        "core/column",
        {
          className: "logo",
          verticalAlignment: "center",
          style: { spacing: { padding: "0", margin: "0" } },
        },
        [
          [
            "core/site-logo",
            {
              anchor: "site-logo",
              align: "center",
              style: { spacing: { padding: "0", margin: "0" } },
            },
          ],
        ],
      ],
      [
        "core/column",
        { className: "column-search", verticalAlignment: "center" },
        [
          [
            "core/group",
            {
              anchor: "site-search",
              tagName: "div",
              layout: { type: "constrained" },
            },
            [
              [
                "core/search",
                {
                  label: "Search",
                  showLabel: false,
                  placeholder: "Search...",
                  buttonText: "Search",
                  buttonPosition: "button-inside",
                  buttonUseIcon: true,
                  isSearchFieldHidden: false,
                  width: 100,
                  widthUnit: "%",
                  align: "center",
                  backgroundColor: "element-bg",
                  fontSize: "small",
                  textColor: "text-soft",
                  style: { spacing: { padding: "0 0 0 10rem", margin: "0" } },
                },
              ],
            ],
          ],
        ],
      ],
      [
        "core/column",
        { className: "column-menu", verticalAlignment: "center" },
        [
          [
            "core/group",
            {
              anchor: "menu-wrapper",
              align: "full",
              layout: { type: "flex", flexWrap: "nowrap" },
              style: { spacing: { blockGap: "2rem" } },
            },
            [
              ["cns-theme/cns-header-nav", {}, []],
              [
                "core/navigation",
                {
                  anchor: "hamburger-menu",
                  overlayMenu: "always",
                  overlayBackgroundColor: "header-bg",
                  overlayTextColor: "header-text",
                },
              ],
            ],
          ],
        ],
      ],
    ],
  ],
  [
    "core/group",
    {
      anchor: "mobile-search",
      className: "mobile-only",
      tagName: "div",
      layout: { type: "constrained" },
    },
    [
      [
        "core/search",
        {
          label: "Search",
          showLabel: false,
          placeholder: "Search...",
          buttonText: "Search",
          buttonPosition: "button-inside",
          buttonUseIcon: true,
          isSearchFieldHidden: false,
          width: 100,
          widthUnit: "%",

          align: "center",
          backgroundColor: "element-bg",
          fontSize: "small",
          textColor: "text-soft",
        },
      ],
    ],
  ],
];

export default function Edit({
  attributes,
  setAttributes,
}: BlockEditProps<HeaderAttributes>) {
  const { backgroundColor, textColor } = attributes;

  const style: CSSProperties = {};
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (textColor) style.color = textColor;

  return (
    <div {...useBlockProps({ style })}>
      <InspectorControls>
        <PanelColorSettings
          title={__("Color", "cns-theme")}
          colorSettings={[
            {
              value: backgroundColor,
              onChange: (val) => setAttributes({ backgroundColor: val ?? "" }),
              label: __("Background", "cns-theme"),
            },
            {
              value: textColor,
              onChange: (val) => setAttributes({ textColor: val ?? "" }),
              label: __("Text", "cns-theme"),
            },
          ]}
        />
      </InspectorControls>
      <InnerBlocks template={TEMPLATE} />
    </div>
  );
}
