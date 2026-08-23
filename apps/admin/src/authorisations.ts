// roles: superadmin (can access everything), 
// admin (can access resources of the selected event), can update their own password
// judge (can access the voting dashboard and their own votes)

export const filterEventId =
    (filterName: string) =>
        async (request: any, context: any) => {
            const eventId = context.currentAdmin?.eventId

            return {
                ...request,
                query: {
                    ...request.query,
                    filters: {
                        ...request.query?.filters,
                        [filterName]: eventId,
                    },
                },
                payload: request.payload
                    ? {
                        ...request.payload,
                        [filterName]: eventId,
                    }
                    : request.payload,
            }
        }

export const addEventFilter = async (filterName: string = "id", request: any, context: any) => {
    const eventId = context.currentAdmin?.eventId
    if (!eventId) return request

    return {
        ...request,
        query: {
            ...request.query,
            filters: {
                ...request.query?.filters,
                filterName: eventId,
            },
        },
        payload: request.payload
            ? { ...request.payload, eventId }
            : request.payload,
    }
}

export const canCreate = ({ currentAdmin, resource }: any) => {
    if (currentAdmin.role === 'superadmin') return true
    if (currentAdmin?.role !== 'admin' || !currentAdmin?.eventId) return false
    if (resource?.id === 'Account') return false
    return true
}

export const canAccessResourceFieldFilter =
    (fieldName: string) =>
        ({ currentAdmin, record }: any) => {
            const adminValue = currentAdmin?.eventId
            return record?.params?.[fieldName] === adminValue
        }

export type AccessHandler = (args: any) => boolean

export const andAccess =
    (...filters: AccessHandler[]): AccessHandler =>
        (args) =>
            filters.every((filter) => filter(args))

export const orAccess =
    (...filters: AccessHandler[]): AccessHandler =>
        (args) =>
            filters.some((filter) => filter(args))

export const canAccessResourceRoleFilter =
    (roleName: string) => ({ currentAdmin }: any) => currentAdmin.role === roleName