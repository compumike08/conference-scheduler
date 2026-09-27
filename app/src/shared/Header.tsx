import {
  Link,
  matchPath,
  useLocation,
} from "react-router";
import { AppBar, Box, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import { useAppSelector, type RootState } from "../app/store";
import { UserRole } from "../constants/userConstants";

function Header() {
  const { pathname } = useLocation();
  const { token } = useAppSelector((state: RootState) => state.login);
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const { roles = [] } = currentUser ?? {};
  const isAdminUser = roles.includes(UserRole.ROLE_ADMIN);

  const ROUTE_CONST = [
    {
      title: 'Home',
      path: '/'
    },
    {
      title: 'About',
      path: '/about'
    },
    {
      title: 'Register',
      path: '/register'
    },
    {
      title: 'Login',
      path: '/login'
    },
    {
      title: 'Logout',
      path: '/logout'
    },
    {
      title: 'Member',
      path: '/member'
    },
    {
      title: 'Admin Dashboard',
      path: '/adminDashboard'
    }
  ];

  function useRouteMatch(patterns: readonly string[]) {
    for (let i = 0; i < patterns.length; i += 1) {
      const pattern = patterns[i];
      const possibleMatch = matchPath(pattern, pathname);
      if (possibleMatch !== null) {
        return possibleMatch;
      }
    }

    return null;
  }

  const currentRoute = ROUTE_CONST.find((route) => 
    matchPath({ path: route.path }, pathname)
  );

  // You need to provide the routes in descendant order.
  // This means that if you have nested routes like:
  // users, users/new, users/edit.
  // Then the order should be ['users/add', 'users/edit', 'users'].
  const routeArray = [ROUTE_CONST[0].path, ROUTE_CONST[1].path];
  
  if (isAdminUser) {
    routeArray.push(ROUTE_CONST[6].path);
  }
  
  if (token !== null) {
    routeArray.push(ROUTE_CONST[4].path);
  }

  const routeMatch = useRouteMatch(routeArray);
  const currentTab = routeMatch?.pattern?.path;
  const appBarTitle = currentRoute ? currentRoute.title : "";

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            {appBarTitle}
          </Typography>

          {/* Flex spacer pushes everything after it to the far right */}
          <Box sx={{ flexGrow: 1 }} />

          <Tabs
            value={currentTab || false}
            textColor="inherit" // Ensures white text inside the AppBar
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#ffffff',
              },
            }}
            aria-label="navigation tabs"
          >
            <Tab label={ROUTE_CONST[0].title} value={ROUTE_CONST[0].path} to={ROUTE_CONST[0].path} component={Link} />
            <Tab label={ROUTE_CONST[1].title} value={ROUTE_CONST[1].path} to={ROUTE_CONST[1].path} component={Link} />
            {isAdminUser && (
              <Tab label={ROUTE_CONST[6].title} value={ROUTE_CONST[6].path} to={ROUTE_CONST[6].path} component={Link} />
            )}
            {token !== null && (
              <Tab label={ROUTE_CONST[4].title} value={ROUTE_CONST[4].path} to={ROUTE_CONST[4].path} component={Link} />
            )}
          </Tabs>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header;
