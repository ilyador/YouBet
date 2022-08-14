import React from 'react'
import { Auth } from 'aws-amplify'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import CameraIcon from '@material-ui/icons/PhotoCamera'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'


const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    flexGrow: 1,
  },
  icon: {
    marginRight: theme.spacing(2),
  },
}))


function Layout ({ updateUserState, component: Component, match, ...rest }) {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const isMenuOpen = Boolean(anchorEl)
  const c = useStyles()

  const handleLogOut = () => {
    Auth.signOut().then(() => { updateUserState(null) })
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }


  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleLogOut}>
        Log Out
      </MenuItem>
    </Menu>
  )


  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <CameraIcon className={c.icon}/>
          <Typography variant="h6" className={c.title}>
            TODO
          </Typography>
          <IconButton
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle/>
          </IconButton>
        </Toolbar>
      </AppBar>
      {renderMenu}
      <Container className={c.cardGrid} maxWidth="sm">
        <Component {...rest} />
      </Container>
    </>
  )
}


export default Layout
