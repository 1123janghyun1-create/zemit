import React from "react";
import CollectionsClient from "./CollectionsClient";

export const metadata = {
  title: "명예의 전당 큐레이션 컬렉션 | zemix",
  description: "국내 최고의 AI 툴, 1인 개발자 신화 등 테마별로 엄선된 사이드 프로젝트 큐레이션",
};

export default function CollectionsPage() {
  return <CollectionsClient />;
}
