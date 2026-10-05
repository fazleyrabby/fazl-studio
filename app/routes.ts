import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("work", "routes/work.tsx"),
  route("work/:slug", "routes/project.tsx"),
  route("studio", "routes/studio.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
