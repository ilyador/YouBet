/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = `subscription OnCreateUser {
  onCreateUser {
    id
    name
    tasks {
      items {
        id
        text
        expirationTime
        price
        complete
      }
      nextToken
    }
  }
}
`;
export const onUpdateUser = `subscription OnUpdateUser {
  onUpdateUser {
    id
    name
    tasks {
      items {
        id
        text
        expirationTime
        price
        complete
      }
      nextToken
    }
  }
}
`;
export const onDeleteUser = `subscription OnDeleteUser {
  onDeleteUser {
    id
    name
    tasks {
      items {
        id
        text
        expirationTime
        price
        complete
      }
      nextToken
    }
  }
}
`;
export const onCreateTask = `subscription OnCreateTask {
  onCreateTask {
    id
    text
    expirationTime
    price
    complete
  }
}
`;
export const onUpdateTask = `subscription OnUpdateTask {
  onUpdateTask {
    id
    text
    expirationTime
    price
    complete
  }
}
`;
export const onDeleteTask = `subscription OnDeleteTask {
  onDeleteTask {
    id
    text
    expirationTime
    price
    complete
  }
}
`;
