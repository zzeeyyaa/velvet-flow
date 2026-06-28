import { parse } from 'yaml'

export const getOpenApiSpec = async (): Promise<any> => {
    try {
        // import.meta.dir membaca direktori file ini (src/docs)
        const fileConfig = await Bun.file(`${import.meta.dir}/../../openapi-spec.yaml`).text()
        return parse(fileConfig)
    } catch (error) {
        console.error('❌ Failed to load openapi-spec.yaml', error)
        return {}
    }
}