import { Context, Session, Command, assertProperty } from 'koishi-core'
import { AxiosRequestConfig } from 'axios'
import ascii2d from './ascii2d'
import saucenao from './saucenao'

export interface Config {
  lowSimilarity?: number
  highSimilarity?: number
  saucenaoApiKey?: string[]
  axiosConfig?: AxiosRequestConfig
}

const imageRE = /\[CQ:image,file=([^,]+),url=([^\]]+)\]/g
function extractImages(message: string) {
  let search = imageRE.exec(message)
  const result: string[] = []
  while (search) {
    result.push(search[2])
    search = imageRE.exec(message)
  }
  return result
}

async function mixedSearch(url: string, session: Session, config: Config) {
  return await saucenao(url, session, config, true) && ascii2d(url, session)
}

export const name = 'search'

export function apply(ctx: Context, config: Config = {}) {
  assertProperty(config, 'saucenaoApiKey')

  ctx.command('search [image]', '搜图片')
    .alias('搜图')
    .action(search(mixedSearch))
    .subcommand('saucenao [image]', '使用 saucenao 搜图')
    .action(search(saucenao))
    .subcommand('ascii2d [image]', '使用 ascii2d 搜图')
    .action(search(ascii2d))

  const pending = new Set<string>()

  type SearchCallback = (url: string, session: Session, config: Config) => Promise<any>

  async function searchUrls(session: Session, urls: string[], callback: SearchCallback) {
    const id = session.channelId
    pending.add(id)
    let hasSuccess = false, hasFailure = false
    await Promise.all(urls.map((url) => {
      return callback(url, session, config).then(() => hasSuccess = true, () => hasFailure = true)
    }))
    pending.delete(id)
    if (!hasFailure) return
    return session.send(hasSuccess ? '其他图片搜索失败。' : '搜索失败。')
  }

  function search(callback: SearchCallback): Command.Action {
    return async ({ session }) => {
      const id = session.channelId
      if (pending.has(id)) return '存在正在进行的查询，请稍后再试。'

      const urls = extractImages(session.content)
      if (urls.length) {
        return searchUrls(session, urls, callback)
      }

      const dispose = session.middleware(({ content }, next) => {
        dispose()
        const urls = extractImages(content)
        if (!urls.length) return next()
        return searchUrls(session, urls, callback)
      })

      return '请发送图片。'
    }
  }
}
