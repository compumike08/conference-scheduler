import {
  Link,
  matchPath,
  useLocation,
} from "react-router";
import { AppBar, Tab, Tabs, Toolbar } from "@mui/material";

function Header() {

  function useRouteMatch(patterns: readonly string[]) {
    const { pathname } = useLocation();

    for (let i = 0; i < patterns.length; i += 1) {
      const pattern = patterns[i];
      const possibleMatch = matchPath(pattern, pathname);
      if (possibleMatch !== null) {
        return possibleMatch;
      }
    }

    return null;
  }

  // You need to provide the routes in descendant order.
  // This means that if you have nested routes like:
  // users, users/new, users/edit.
  // Then the order should be ['users/add', 'users/edit', 'users'].
  const routeMatch = useRouteMatch(['/about', '/']);
  const currentTab = routeMatch?.pattern?.path;

  return (
    <AppBar position="static">
      <Toolbar>
        <Tabs
          value={currentTab}
          textColor="inherit" // Ensures white text inside the AppBar
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#ffffff',
            },
          }}
          aria-label="navigation tabs"
        >
          <Tab label="Home" value="/" to="/" component={Link} />
          <Tab label="About" value="/about" to="/about" component={Link} />
        </Tabs>
      </Toolbar>
    </AppBar>
  )
}

export default Header;
