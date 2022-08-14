/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core'
import Timer from 'react-compound-timer'
import Checkbox from '@material-ui/core/Checkbox'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Chip from '@material-ui/core/Chip'
import grey from '@material-ui/core/colors/grey'


const day = 1000 * 60 * 60 * 24
const hour = 1000 * 60 * 60
const minute = 1000 * 60


const useStyles = makeStyles(theme => ({
  root: {
    borderRadius: 24,
    [theme.breakpoints.down('xs')]: {
      borderRadius: 8,
      paddingLeft: theme.spacing(1)
    }
  },
  actions: {
    [theme.breakpoints.down('xs')]: {
      right: theme.spacing(1)
    }
  },
  itemIcon: {
    [theme.breakpoints.down('xs')]: {
      minWidth: 0
    }
  },
  chip: {
    backgroundColor: grey[50]
  },
  timer: {
    marginLeft: theme.spacing(1)
  },
  timerExpiring: {
    color: 'red',
    borderColor: 'red'
  }
}))



function Item ({ task, handleComplete = () => {}, handleExpire = () => {} }) {
  const [time, setTime] = useState(null)
  const [expired, setExpired] = useState(false)
  const [almostExpired, setAlmostExpired] = useState(false)
  const c = useStyles()


  useEffect(() => {
    let now = Date.now()
    let expirationTime = task.expirationTime
    let expire = expirationTime - now
    let isExpired = (expire <= 0)
    setExpired(isExpired)

    if (!isExpired) {
      setTime(expire)
      setAlmostExpired(expire / hour < 1)
    }
  }, [])


  const handleExpireCallback = id => {
    setExpired(true)
    handleExpire(id)
  }


  return (
    <ListItem
      button dense
      role={undefined}
      disabled={expired || task.complete}
      className={c.root}
      onClick={handleComplete(task.id)}
    >
      <ListItemIcon classes={{ root: c.itemIcon }}>
        <Checkbox
          edge='start'
          checked={task.complete}
          tabIndex={-1}
        />
      </ListItemIcon>
      <ListItemText
        id={task.id}
        primary={task.text}
      />
      <ListItemSecondaryAction classes={{ root: c.actions }}>
        <Chip
          variant='outlined'
          color='primary'
          label={'$'+task.price}
          classes={{ outlined: c.chip }}
        />

        {time && !expired && !task.complete &&

        <Chip
          variant='outlined'
          className={c.timer}
          color='primary'
          classes={{
            outlinedPrimary: almostExpired && c.timerExpiring,
            outlined: c.chip
          }}
          label={
            <Timer
              formatValue={val => `${(val < 10 ? `0${val}` : val)}`}
              initialTime={time}
              direction='backward'
              startImmediately={true}
              checkpoints={[
                {
                  time: hour,
                  callback: () => setAlmostExpired(true),
                },
                {
                  time: 0,
                  callback: () => handleExpireCallback(task.id),
                }
              ]}
            >
              {() => (
                <>
                  {(time / day > 1) && <><Timer.Days formatValue={v => v}/>&#58;</>}
                  {(time / hour > 1) && <><Timer.Hours/>&#58;</>}
                  {(time / minute > 1) ? <><Timer.Minutes/>&#58;</> :
                    <span>00:</span>}
                  <Timer.Seconds/>
                </>
              )}
            </Timer>
          }
        />

        }
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default Item