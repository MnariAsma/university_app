import { CssBaseline } from "@mui/material";
import Sidebar from "../sideBar/sideBar";
import type { ReactNode } from "react";
import Header from "../header/Header";
import { ContentBox, LayoutWrapper, MainWrapper } from "./AppLAyoutStyle";
// import { useReservationSocket } from "../../modules/reservation/hooks/useReservationSocket";

interface LayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: LayoutProps) => {
  // useReservationSocket(); // Global real-time socket updates for all pages within layout
  return (
    <LayoutWrapper>
      <CssBaseline />
      <Sidebar />
      <MainWrapper>
        <Header />
        <ContentBox component="main">
          {children}
        </ContentBox>
      </MainWrapper>
    </LayoutWrapper>
  );
};
export default AppLayout;
