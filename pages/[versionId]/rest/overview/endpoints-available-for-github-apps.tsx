import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { MainContextT, MainContext, getMainContext } from 'components/context/MainContext'
import {
  getArticleContextFromRequest,
  ArticleContextT,
  ArticleContext,
} from 'components/context/ArticleContext'
import { ArticlePage } from 'components/article/ArticlePage'
import { Link } from 'components/Link'
import { getEnabledForApps } from 'lib/rest/index.js'

type OperationT = {
  slug: string
  verb: string
  requestPath: string
}

type EnabledAppCategoryT = {
  [category: string]: OperationT[]
}

type AppDataT = {
  [version: string]: EnabledAppCategoryT
}

let enabledForApps: AppDataT | null = null

type Props = {
  mainContext: MainContextT
  enabledForApps: EnabledAppCategoryT
  articleContext: ArticleContextT
}

export default function Category({ mainContext, enabledForApps, articleContext }: Props) {
  const { locale } = useRouter()

  const content = Object.entries(enabledForApps).map(([category, operations]) => (
    <div key={`enabledAppCategory-${category}`}>
      {operations.length > 0 && (
        <h3 id={category}>
          <Link href={`/${locale}/rest/reference/${category}`}>{category}</Link>
        </h3>
      )}
      <ul>
        {operations.map((operation) => (
          <li key={`enabledAppOperation-${operation.slug}`}>
            <Link href={`/${locale}/rest/reference/${category}#${operation.slug}`}>
              <code>
                <span className="text-uppercase">{operation.verb}</span> {operation.requestPath}
              </code>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ))

  return (
    <MainContext.Provider value={mainContext}>
      <ArticleContext.Provider value={articleContext}>
        <ArticlePage structuredContent={content} />
      </ArticleContext.Provider>
    </MainContext.Provider>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const req = context.req as object
  const res = context.res as object
  const currentVersion = context.query.versionId as string
  const mainContext = getMainContext(req, res)

  if (!enabledForApps) {
    enabledForApps = (await getEnabledForApps()) as AppDataT
  }

  return {
    props: {
      mainContext,
      enabledForApps: enabledForApps[currentVersion],
      articleContext: getArticleContextFromRequest(req),
    },
  }
}
