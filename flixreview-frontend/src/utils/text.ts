export function truncateWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/)
  return words.length <= maxWords ? value : `${words.slice(0, maxWords).join(' ')}...`
}

export function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  const truncated = value.slice(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  return `${lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : truncated}...`
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
