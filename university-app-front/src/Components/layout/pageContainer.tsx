import { Content, Header, StyledContainer, Title } from "./StyledPageContainer";
import type { PageContainerProps } from "./PageContainerInterface";


export default function PageContainer({ children, title, actions }: PageContainerProps) {
  return (
    <StyledContainer>
      <Header>
        {title && <Title variant="h4">{title}</Title>}
        {actions}
      </Header>

      <Content>
        {children}
      </Content>
    </StyledContainer>
  );
}
