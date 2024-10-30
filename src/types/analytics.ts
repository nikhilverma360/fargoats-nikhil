export interface MetricCardProps {
    title: string
    value: string
    change: string
  }
  
  export interface AnalyticsData {
    date: string
    tvl: number
    dau: number
    trx: number
  }
  
  export interface ChartProps {
    data: AnalyticsData[]
    config: {
      [key: string]: {
        label: string
        color: string
      }
    }
  }