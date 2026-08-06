import { redirect } from 'next/navigation'

type Props = { params: Promise<{ stageNum: string }> }

export default async function StagePage({ params }: Props) {
  const { stageNum } = await params
  redirect(`/onboarding/${stageNum}`)
}
