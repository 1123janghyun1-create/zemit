import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "zemix — 사이드 프로젝트 메이커 커뮤니티",
    short_name: "zemix",
    description: "유저를 만나고 함께 만드는 사이드 프로젝트 메이커 커뮤니티 (zemix.vercel.app)",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#3B82F6",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
