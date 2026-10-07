import React from "react";
import {
  Link,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router";
import { Menu, AppBar, Box, IconButton, Tab, Tabs, Toolbar, Typography, useMediaQuery, useTheme, MenuItem } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useAppSelector, type RootState } from "../app/store";
import { UserRole } from "../constants/userConstants";

function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLoggedIn } = useAppSelector((state: RootState) => state.login);
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const { roles = [] } = currentUser ?? {};
  const isAdminUser = roles.includes(UserRole.ROLE_ADMIN);
  const isMemberUser = roles.includes(UserRole.ROLE_MEMBER);
  const isSchedulerUser = roles.includes(UserRole.ROLE_SCHEDULER);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (path: string) => {
    handleMenuClose();
    navigate(path);
  };

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
      title: 'Create Member',
      path: '/createMember'
    },
    {
      title: 'Admin Dashboard',
      path: '/admin/dashboard'
    },
    {
      title: 'Admin - Edit User Roles',
      path: '/admin/user/:userUuid'
    },
    {
      title: 'Locations',
      path: '/locationList'
    },
    {
      title: 'Locations - Add New Location',
      path: '/createLocation'
    },
    {
      title: 'Events',
      path: '/eventList'
    },
    {
      title: 'Events - Add New Event',
      path: '/createEvent'
    },
    {
      title: 'Locations - Edit Location',
      path: '/editLocation/:locationUuid'
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
  
  if (isLoggedIn) {
    routeArray.push(ROUTE_CONST[4].path);
  }

  if (isLoggedIn && !isMemberUser) {
    routeArray.push(ROUTE_CONST[5].path);
  }

  if (isAdminUser || isSchedulerUser) {
    routeArray.push(ROUTE_CONST[8].path);
  }

  if (isMemberUser || isAdminUser || isSchedulerUser) {
    routeArray.push(ROUTE_CONST[10].path);
  }

  const routeMatch = useRouteMatch(routeArray);
  let currentTab = routeMatch?.pattern?.path;
  if (currentTab && !routeArray.includes(currentTab)) {
    currentTab = undefined;
  }
  const appBarTitle = currentRoute ? currentRoute.title : "";

  const theme = useTheme();
  // Returns true if screen size is below 'md' (960px by default)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            {appBarTitle}
          </Typography>

          {/* Flex spacer pushes everything after it to the far right */}
          <Box sx={{ flexGrow: 1 }} />

          {isSmallScreen && (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
              >
                <MenuItem
                  selected={currentTab === ROUTE_CONST[0].path}
                  onClick={() => handleMenuClick(ROUTE_CONST[0].path)}
                >
                  {ROUTE_CONST[0].title}
                </MenuItem>
                <MenuItem
                  selected={currentTab === ROUTE_CONST[1].path}
                  onClick={() => handleMenuClick(ROUTE_CONST[1].path)}
                >
                  {ROUTE_CONST[1].title}
                </MenuItem>

                {(isMemberUser || isAdminUser || isSchedulerUser) && (
                  <MenuItem
                    selected={currentTab === ROUTE_CONST[10].path}
                    onClick={() => handleMenuClick(ROUTE_CONST[10].path)}
                  >
                    {ROUTE_CONST[10].title}
                  </MenuItem>
                )}

                {isAdminUser && (
                  <MenuItem
                    selected={currentTab === ROUTE_CONST[6].path}
                    onClick={() => handleMenuClick(ROUTE_CONST[6].path)}
                  >
                    {ROUTE_CONST[6].title}
                  </MenuItem>
                )}

                {(isAdminUser || isSchedulerUser) && (
                  <MenuItem
                    selected={currentTab === ROUTE_CONST[8].path}
                    onClick={() => handleMenuClick(ROUTE_CONST[8].path)}
                  >
                    {ROUTE_CONST[8].title}
                  </MenuItem>
                )}

                {isLoggedIn && !isMemberUser && (
                  <MenuItem
                    selected={currentTab === ROUTE_CONST[5].path}
                    onClick={() => handleMenuClick(ROUTE_CONST[5].path)}
                  >
                    {ROUTE_CONST[5].title}
                  </MenuItem>
                )}

                {isLoggedIn && (
                  <MenuItem
                    selected={currentTab === ROUTE_CONST[4].path}
                    onClick={() => handleMenuClick(ROUTE_CONST[4].path)}
                  >
                    {ROUTE_CONST[4].title}
                  </MenuItem>
                )}
              </Menu>
            </>
          )}

          {!isSmallScreen && (
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

              {(isMemberUser || isAdminUser || isSchedulerUser) && (
                <Tab label={ROUTE_CONST[10].title} value={ROUTE_CONST[10].path} to={ROUTE_CONST[10].path} component={Link} />
              )}

              {isAdminUser && (
                <Tab label={ROUTE_CONST[6].title} value={ROUTE_CONST[6].path} to={ROUTE_CONST[6].path} component={Link} />
              )}
              {(isAdminUser || isSchedulerUser) && (
                <Tab label={ROUTE_CONST[8].title} value={ROUTE_CONST[8].path} to={ROUTE_CONST[8].path} component={Link} />
              )}
              {isLoggedIn && !isMemberUser && (
                <Tab label={ROUTE_CONST[5].title} value={ROUTE_CONST[5].path} to={ROUTE_CONST[5].path} component={Link} />
              )}
              {isLoggedIn && (
                <Tab label={ROUTE_CONST[4].title} value={ROUTE_CONST[4].path} to={ROUTE_CONST[4].path} component={Link} />
              )}
            </Tabs>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header;
