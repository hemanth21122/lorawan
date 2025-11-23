import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Enhanced Random Forest regressor for ET prediction
function trainForest(samples, targets, nTrees = 50) {
  // samples: array of [temp, moisture]
  // targets: array of ET
  const trees = []
  const N = samples.length
  if (N === 0) return trees

  // FAO-based ET factors
  const ETFactors = {
    tempWeight: 0.08, // Temperature coefficient based on FAO guidelines
    moistWeight: 0.03, // Soil moisture coefficient
    radiationEffect: 1.2, // Solar radiation multiplier for daytime
    windEffect: 0.7, // Wind reduction factor
    maxET: 9.0, // Maximum ET for arid regions (mm/day)
    minET: 1.0  // Minimum ET for humid regions (mm/day)
  }

  for (let t = 0; t < nTrees; t++) {
    // Bootstrap sample with stratification
    const idxs = []
    const numStrata = 5
    const strataSize = Math.ceil(N / numStrata)
    
    for (let stratum = 0; stratum < numStrata; stratum++) {
      const start = stratum * strataSize
      const end = Math.min((stratum + 1) * strataSize, N)
      for (let i = 0; i < (end - start); i++) {
        idxs.push(start + Math.floor(Math.random() * (end - start)))
      }
    }

    // Find best split using multiple features and thresholds
    let best = null
    let bestMSE = Infinity
    
    // Consider combination rules based on FAO guidelines
    const rules = [
      // Single feature rules
      {feature: 0, op: '<='},  // Temperature threshold
      {feature: 1, op: '<='},  // Moisture threshold
      // Combined feature rules
      {features: [0, 1], op: 'combined'}, // Temperature-moisture interaction
    ]

    for (const rule of rules) {
      if (rule.op === 'combined') {
        // Try temperature-moisture interaction thresholds
        const temps = idxs.map(i => samples[i][0])
        const moists = idxs.map(i => samples[i][1])
        
        const tempThresholds = Array.from(new Set(temps.map(t => Math.round(t))))
        const moistThresholds = Array.from(new Set(moists.map(m => Math.round(m/5)*5)))

        for (const tempThr of tempThresholds) {
          for (const moistThr of moistThresholds) {
            let left = []
            let right = []
            
            for (const i of idxs) {
              // FAO-based decision rule
              const ET_base = (samples[i][0] * ETFactors.tempWeight + 
                             samples[i][1] * ETFactors.moistWeight)
              const adjustedET = Math.min(ETFactors.maxET,
                                Math.max(ETFactors.minET, ET_base))

              if (samples[i][0] <= tempThr && samples[i][1] <= moistThr) {
                left.push(adjustedET)
              } else {
                right.push(adjustedET)
              }
            }

            // Calculate weighted MSE based on sample size
            const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0
            const mse = arr => arr.length ? arr.reduce((s,x)=>s+(x-mean(arr))**2,0)/arr.length : 0
            
            const totalMSE = (
              (left.length * mse(left) + right.length * mse(right)) / 
              (left.length + right.length)
            )

            if (totalMSE < bestMSE && left.length > 0 && right.length > 0) {
              bestMSE = totalMSE
              best = {
                type: 'combined',
                tempThr,
                moistThr,
                leftMean: mean(left),
                rightMean: mean(right)
              }
            }
          }
        }
      } else {
        // Single feature threshold
        const feature = rule.feature
        const values = idxs.map(i => samples[i][feature])
        const thresholds = Array.from(new Set(values.map(v => 
          feature === 0 ? Math.round(v) : Math.round(v/5)*5
        )))

        for (const thr of thresholds) {
          let left = []
          let right = []
          
          for (const i of idxs) {
            if (samples[i][feature] <= thr) {
              left.push(targets[i])
            } else {
              right.push(targets[i])
            }
          }

          const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0
          const mse = arr => arr.length ? arr.reduce((s,x)=>s+(x-mean(arr))**2,0)/arr.length : 0
          
          const totalMSE = (
            (left.length * mse(left) + right.length * mse(right)) / 
            (left.length + right.length)
          )

          if (totalMSE < bestMSE && left.length > 0 && right.length > 0) {
            bestMSE = totalMSE
            best = {
              type: 'single',
              feature,
              thr,
              leftMean: mean(left),
              rightMean: mean(right)
            }
          }
        }
      }
    }

    if (best) trees.push(best)
  }
  
  return trees
}

function predictForest(trees, sample) {
  if (!trees || trees.length === 0) return 0
  
  const preds = trees.map(tree => {
    if (tree.type === 'combined') {
      return sample[0] <= tree.tempThr && sample[1] <= tree.moistThr ? 
        tree.leftMean : tree.rightMean
    } else {
      return sample[tree.feature] <= tree.thr ? 
        tree.leftMean : tree.rightMean
    }
  })
  
  return preds.reduce((a,b)=>a+b,0)/preds.length
}

export default function ForecastChart({ history, forecastTick=0 }) {
  // history: array of { temperature, soilMoisture, timestamp }
  const { labels, forecast } = useMemo(() => {
    // aggregate per-day mean
    const days = {}
    for (const h of history) {
      const d = new Date(h.timestamp).toISOString().slice(0,10)
      days[d] = days[d] || { temps: [], moist: [] }
      if (h.temperature !== undefined) days[d].temps.push(parseFloat(h.temperature))
      if (h.soilMoisture !== undefined) days[d].moist.push(parseFloat(h.soilMoisture))
    }
    const dayKeys = Object.keys(days).sort()
    const samples = []
    const targets = []
    for (const k of dayKeys) {
      const tAvg = days[k].temps.length ? days[k].temps.reduce((a,b)=>a+b,0)/days[k].temps.length : 20
      const mAvg = days[k].moist.length ? days[k].moist.reduce((a,b)=>a+b,0)/days[k].moist.length : 50
      // Create synthetic target ET using simple physics-like formula (placeholder)
      const et = 0.08 * tAvg + 0.03 * mAvg
      samples.push([tAvg, mAvg])
      targets.push(et)
    }

    // train small forest
    const trees = trainForest(samples, targets, Math.min(40, Math.max(1, samples.length*4)))

    // generate next 10 days predictions using last known conditions with small noise
    const last = samples.length ? samples[samples.length-1] : [25, 50]
    const labels = []
    const forecast = []
    const baseDate = new Date()
    for (let i=1;i<=10;i++) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() + i)
      labels.push(d.toISOString().slice(0,10))
      // vary temp and moisture slightly
      const temp = last[0] + (Math.random()-0.5)*2
      const moist = last[1] + (Math.random()-0.5)*4
      const pred = predictForest(trees, [temp, moist])
      forecast.push(Number(pred.toFixed(3)))
    }

    return { labels, forecast }
  }, [history, forecastTick])

  const data = {
    labels,
    datasets: [
      {
        label: 'ET (mm/day) - forecast (10 days)',
        data: forecast,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)'
      }
    ]
  }

  const options = { responsive: true }

  return (
    <div style={{height: '320px'}}>
      <Line data={data} options={options} />
    </div>
  )
}
