import React from "react";
import DemodayClient from "./DemodayClient";

export const metadata = {
  title: "가상 부스 데모데이 엑스포 (Virtual Demo Day) | zemix",
  description: "멋쟁이사자처럼, 디프만, 매시업, 부트캠프 및 대학 동아리 연합 프로젝트 쇼케이스 관",
};

export default function DemodayPage() {
  return <DemodayClient />;
}
