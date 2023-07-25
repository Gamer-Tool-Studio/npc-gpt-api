export type characterType = {
  name: string
  age: number
  personality: {
    traits: string[]
    dialogueStyle: string
  }
  'background story': string
  'game knowledge': string
  interests: Record<string, number>
  supportiveness: number
}
