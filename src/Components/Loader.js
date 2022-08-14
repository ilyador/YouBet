import { makeStyles } from '@material-ui/core'
import React from 'react'
import SyncIcon from '@material-ui/icons/Sync';


const useStyles = makeStyles(theme => ({
  wrapper: {
    width: '100%',
    padding: theme.spacing(3)
  },
  spinner: size => ({
    width: size,
    margin: '0 auto'
  }),
  uploadingIcon: size => ({
    animation: 'rotating 2s linear infinite',
    fontSize: size
  }),
}))


function Loader ({ size = 24 }) {
  const c = useStyles(size)

  return (
    <div className={c.wrapper}>
      <div className={c.spinner}>
        <SyncIcon className={c.uploadingIcon}/>
      </div>
    </div>
  )
}

export default Loader