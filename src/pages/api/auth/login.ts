// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { findChromeExecutablePath } from '@/utils'
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer, { Browser } from 'puppeteer-core'

type Data = {
  access_token: string
}

const loginHandler = async function handler(req: NextApiRequest, res: NextApiResponse<IRestfulResponse<Data>>) {
  if (req.method !== 'POST') {
    res.status(200).json({ status: 405, message: 'Method not allowed' })
    return
  }
  const { username, password } = req.body
  if (!username || !password) {
    res.status(200).json({ status: 400, message: 'Bad request' })
    return
  }

  let browser: Nuallable<Browser> = null
  try {
    if (process.env.NODE_ENV === 'development') {
      browser = await puppeteer.launch({
        headless: false,
        executablePath: findChromeExecutablePath(),
      })
    } else {
      browser = await puppeteer.connect({
        browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT,
      })
    }
    // setup page
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    // open chat.openai.com
    await page.goto('https://chat.openai.com')
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[data-testid="login-button"]'),
    ])
    // login
    await page.type('input#username', username)
    await page.click('button[type="submit"]')
    await page.waitForSelector('input#password')
    await page.type('input#password', password)
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('button[type="submit"]')])
    // get session
    const sesson = await page.goto('https://chat.openai.com/api/auth/session').then((res) => res?.json())
    res.status(200).json({ status: 200, message: 'success', data: sesson })
  } catch (error) {
    console.error(error)
    await browser?.close()
    res.status(200).json({ status: 500, message: 'Internal server error' })
  }
}

export default loginHandler
