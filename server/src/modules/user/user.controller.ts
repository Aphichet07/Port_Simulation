import { Elysia, t } from "elysia";
import { userService } from "./user.service";

export const userController = new Elysia({ prefix: '/user' })

    //get all user
    .get('/', async () => {
        return await userService.getAllUsers()
    })

    //get user by id
    .get('/:id', async ({ params: { id } }) => {
        return await userService.getUserById(Number(id))
    }, {
        params: t.Object({ id: t.String() })
    })

    //create user
    .post('/', async ({ body }) => {
        return await userService.createUser(body)
    }, {
        body: t.Object({ name: t.String(), email: t.String(), password: t.String() })
    })

    //update user
    .put('/:id', async ({ params: { id }, body }) => {
        return await userService.updateUser(Number(id), body)
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({ name: t.String(), email: t.String(), password: t.String() })
    })

    //delete user
    .delete('/:id', async ({ params: { id } }) => {
        return await userService.deleteUser(Number(id))
    }, {
        params: t.Object({ id: t.String() })
    })
    