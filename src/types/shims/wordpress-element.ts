// `@wordpress/element` is a thin re-export layer over React. Its published type
// entry (`build-types/index.d.ts`) re-exports from its own untyped `src/*.ts`
// files, which `skipLibCheck` cannot skip (they aren't `.d.ts`), so type-checking
// would surface errors inside WordPress's own source. A `paths` mapping in
// tsconfig.json points `@wordpress/element` here instead, giving the hooks their
// accurate React types. Only the React surface the blocks actually import is
// re-exported; element-only helpers (createInterpolateElement, RawHTML, …) are
// not used anywhere in this theme.
export {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
  useContext,
  createElement,
  Fragment,
} from "react";
