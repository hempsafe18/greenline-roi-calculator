import { useState, useCallback, useRef } from "react";
import "@/App.css";
import { Leaf, TrendingUp, Users, DollarSign, Target, CheckCircle, XCircle, Download, Loader2 } from "lucide-react";
import html2pdf from 'html2pdf.js';

const COST_PER_ACTIVATION_BASE = 225;
const COST_PER_ACTIVATION_VOLUME = 216; // At 30 activations

const getSprintCost = (activations) => {
  const costPerAct = activations >= 30 ? COST_PER_ACTIVATION_VOLUME : COST_PER_ACTIVATION_BASE;
  return activations * costPerAct;
};

const getCostPerActivation = (activations) => {
  return activations >= 30 ? COST_PER_ACTIVATION_VOLUME : COST_PER_ACTIVATION_BASE;
};

const fmt = (n) => '$' + Math.round(n).toLocaleString();
const fmtN = (n) => Math.round(n).toLocaleString();

function App() {
  const [acts, setActs] = useState(20);
  const [sampled, setSampled] = useState(30);
  const [conv, setConv] = useState(80);
  const [price, setPrice] = useState(12);
  const [upb, setUpb] = useState(2);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef(null);

  const calculate = useCallback(() => {
    const sprintCost = getSprintCost(acts);
    const costPerAct = getCostPerActivation(acts);
    const convRate = conv / 100;
    const totalSampled = acts * sampled;
    const totalBuyers = Math.round(totalSampled * convRate);
    const totalUnits = totalBuyers * upb;
    const totalRev = totalUnits * price;
    const netRev = totalRev - sprintCost;
    const cpc = sprintCost / totalSampled;
    const cpb = totalBuyers > 0 ? sprintCost / totalBuyers : 0;
    const roiPct = Math.round(((totalRev - sprintCost) / sprintCost) * 100);
    const beUnits = Math.ceil(sprintCost / price);

    // Calculate ramp data
    const revenuePerAct = sampled * convRate * upb * price;
    let cumRev = 0;
    let beAct = null;
    const rampData = Array.from({ length: acts }, (_, i) => {
      cumRev += revenuePerAct;
      if (cumRev >= sprintCost && beAct === null) beAct = i + 1;
      return {
        act: i + 1,
        cumRev,
        isProfitable: cumRev >= sprintCost,
        pctCovered: Math.round((cumRev / sprintCost) * 100)
      };
    });

    return {
      sprintCost,
      costPerAct,
      totalSampled,
      totalBuyers,
      totalUnits,
      totalRev,
      netRev,
      cpc,
      cpb,
      roiPct,
      beUnits,
      rampData,
      beAct,
      convRate
    };
  }, [acts, sampled, conv, price, upb]);

  const data = calculate();

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPdf(true);
    
    try {
      const element = reportRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Greenline_ROI_Report_${acts}_activations.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="app-container" data-testid="roi-calculator-page">
      {/* Organic background elements */}
      <div className="bg-pattern"></div>
      <div className="leaf-accent leaf-1"><Leaf size={120} /></div>
      <div className="leaf-accent leaf-2"><Leaf size={80} /></div>
      <div className="leaf-accent leaf-3"><Leaf size={60} /></div>

      {/* Header */}
      <header className="header" data-testid="header">
        <div className="logo-container">
          <div className="logo-icon">
            <Leaf size={28} />
          </div>
          <div className="logo-text">
            <h1 data-testid="page-title">Greenline Activations ROI Calculator</h1>
            <p className="subtitle">Activation Sprint ROI Calculator · Prepared March 2026</p>
          </div>
        </div>
        <button 
          className="download-btn"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          data-testid="download-pdf-btn"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 size={18} className="spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Download PDF Report</span>
            </>
          )}
        </button>
      </header>

      <main className="main-content" ref={reportRef}>
        {/* Sprint Parameters Card */}
        <section className="card parameters-card" data-testid="parameters-section">
          <div className="section-header">
            <span className="section-tag">Sprint Parameters</span>
          </div>

          <div className="fixed-cost-badge" data-testid="sprint-cost-badge">
            <span>Sprint cost ({acts} activations / 30 days)</span>
            <strong>{fmt(data.sprintCost)}</strong>
            <span className="cost-per-act">{fmt(data.costPerAct)}/activation</span>
          </div>

          <div className="sliders-container">
            <SliderRow
              label="Number of activations"
              value={acts}
              min={10}
              max={30}
              step={2}
              onChange={setActs}
              displayValue={acts}
              testId="activations-slider"
            />
            <SliderRow
              label="Avg consumers sampled per event"
              value={sampled}
              min={15}
              max={60}
              step={5}
              onChange={setSampled}
              displayValue={sampled}
              testId="sampled-slider"
            />
            <SliderRow
              label="Sample-to-purchase conversion"
              value={conv}
              min={40}
              max={90}
              step={5}
              onChange={setConv}
              displayValue={`${conv}%`}
              testId="conversion-slider"
            />
            <SliderRow
              label="Avg retail price per unit"
              value={price}
              min={6}
              max={20}
              step={1}
              onChange={setPrice}
              displayValue={fmt(price)}
              testId="price-slider"
            />
            <SliderRow
              label="Avg units purchased per buyer"
              value={upb}
              min={1}
              max={4}
              step={1}
              onChange={setUpb}
              displayValue={upb}
              testId="units-slider"
            />
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="metrics-grid" data-testid="metrics-section">
          <MetricCard
            icon={<DollarSign />}
            label="Sprint Cost"
            value={fmt(data.sprintCost)}
            sublabel={`${acts} activations`}
            testId="metric-sprint-cost"
          />
          <MetricCard
            icon={<Users />}
            label="Consumers Reached"
            value={fmtN(data.totalSampled)}
            sublabel="Total sprint"
            testId="metric-consumers"
          />
          <MetricCard
            icon={<Target />}
            label="Est. Units Moved"
            value={fmtN(data.totalUnits)}
            sublabel="At conversion rate"
            highlight
            testId="metric-units"
          />
          <MetricCard
            icon={<TrendingUp />}
            label="Retail Revenue"
            value={fmt(data.totalRev)}
            sublabel="Gross generated"
            highlight
            testId="metric-revenue"
          />
        </section>

        {/* Sprint Economics */}
        <section className="card economics-card" data-testid="economics-section">
          <div className="section-header">
            <span className="section-tag">Sprint Economics</span>
          </div>

          <div className="breakdown-container">
            <div className="breakdown-line">
              <span>Sprint investment</span>
              <span data-testid="breakdown-investment">{fmt(data.sprintCost)}</span>
            </div>
            <div className="breakdown-line">
              <span>Consumers sampled</span>
              <span data-testid="breakdown-sampled">{fmtN(data.totalSampled)} consumers</span>
            </div>
            <div className="breakdown-line">
              <span>Buyers converted</span>
              <span data-testid="breakdown-buyers">{fmtN(data.totalBuyers)} buyers ({conv}%)</span>
            </div>
            <div className="breakdown-line">
              <span>Est. retail revenue generated</span>
              <span data-testid="breakdown-revenue">{fmt(data.totalRev)}</span>
            </div>
            <div className="breakdown-line">
              <span>Cost per consumer reached</span>
              <span data-testid="breakdown-cpc">{fmt(data.cpc)}</span>
            </div>
            <div className="breakdown-line total">
              <span>Net revenue after sprint cost</span>
              <span data-testid="breakdown-net">{fmt(data.netRev)}</span>
            </div>
          </div>

          <div className="roi-grid" data-testid="roi-grid">
            <div className="roi-box">
              <span className="roi-label">Sprint ROI</span>
              <span className="roi-value" data-testid="roi-percentage">{data.roiPct}%</span>
              <span className="roi-sublabel">Revenue vs. investment</span>
            </div>
            <div className="roi-box">
              <span className="roi-label">Cost per Buyer</span>
              <span className="roi-value" data-testid="cost-per-buyer">{fmt(data.cpb)}</span>
              <span className="roi-sublabel">Per converted consumer</span>
            </div>
            <div className="roi-box">
              <span className="roi-label">Break-even Units</span>
              <span className="roi-value" data-testid="breakeven-units">{fmtN(data.beUnits)}</span>
              <span className="roi-sublabel">Units to cover sprint cost</span>
            </div>
          </div>
        </section>

        {/* Activation Ramp */}
        <section className="card ramp-card" data-testid="ramp-section">
          <div className="section-header">
            <span className="section-tag">Activation-by-Activation Revenue Build</span>
          </div>

          <div className="ramp-container">
            {data.rampData.map((item) => (
              <div key={item.act} className="ramp-row" data-testid={`ramp-act-${item.act}`}>
                <span className="ramp-label">Act {item.act}</span>
                <div className="bar-track">
                  <div 
                    className={`bar-fill ${item.isProfitable ? 'profitable' : ''}`}
                    style={{ width: `${Math.min((item.cumRev / (data.totalRev * 1.1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="ramp-revenue">{fmt(item.cumRev)}</span>
                {item.isProfitable ? (
                  <span className="ramp-tag profit">✓ profit</span>
                ) : (
                  <span className="ramp-tag covered">{item.pctCovered}% covered</span>
                )}
              </div>
            ))}
          </div>

          <div className="ramp-summary">
            <span>Break-even at activation: <strong data-testid="breakeven-activation">#{data.beAct || 'Beyond sprint'}</strong></span>
            <span>Total cumulative revenue: <strong data-testid="total-revenue">{fmt(data.totalRev)}</strong></span>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="card comparison-card" data-testid="comparison-section">
          <div className="section-header">
            <span className="section-tag">Why $225/activation is the smartest spend in the room</span>
          </div>

          <div className="table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="greenline-col">Greenline</th>
                  <th>Promo Agency</th>
                  <th>Freelance Rep</th>
                  <th>In-House</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Price per activation</td>
                  <td className="greenline-col">$225</td>
                  <td>$150–180</td>
                  <td>$100–150</td>
                  <td>$300+ <span className="varies">(loaded)</span></td>
                </tr>
                <tr>
                  <td>HempSafe certified rep</td>
                  <td className="greenline-col"><CheckCircle className="check" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><span className="varies">Varies</span></td>
                </tr>
                <tr>
                  <td>Geo-tracked check-in</td>
                  <td className="greenline-col"><CheckCircle className="check" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                </tr>
                <tr>
                  <td>25-point post-visit report</td>
                  <td className="greenline-col"><CheckCircle className="check" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                </tr>
                <tr>
                  <td>Weekly performance reporting</td>
                  <td className="greenline-col"><CheckCircle className="check" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><span className="varies">Varies</span></td>
                </tr>
                <tr>
                  <td>Ambassador Rewards Program</td>
                  <td className="greenline-col"><CheckCircle className="check" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                </tr>
                <tr>
                  <td>Named Florida clients</td>
                  <td className="greenline-col">3CHI, Señorita</td>
                  <td>None listed</td>
                  <td>None</td>
                  <td>N/A</td>
                </tr>
                <tr>
                  <td>Consumer data captured</td>
                  <td className="greenline-col"><CheckCircle className="check" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><XCircle className="cross" size={18} /></td>
                  <td><span className="varies">Varies</span></td>
                </tr>
                <tr>
                  <td>Accountability infrastructure</td>
                  <td className="greenline-col">Full</td>
                  <td>Minimal</td>
                  <td>None</td>
                  <td>Partial</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="callout" data-testid="callout">
            <strong>The real cost of a cheaper rep:</strong> An untrained temp at $150/activation who can't answer dosage questions, skips check-in, and submits no post-visit data costs you more in lost conversions than the $75 you saved. At 80% sample-to-purchase, the rep is the product.
          </div>
        </section>

        {/* Footer */}
        <footer className="footer" data-testid="footer">
          <div className="footer-content">
            <Leaf size={16} />
            <span>Greenline Activations · greenlineactivations.com · Prepared for Plift · March 2026</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

const SliderRow = ({ label, value, min, max, step, onChange, displayValue, testId }) => (
  <div className="slider-row">
    <label>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      data-testid={testId}
    />
    <span className="slider-value" data-testid={`${testId}-value`}>{displayValue}</span>
  </div>
);

const MetricCard = ({ icon, label, value, sublabel, highlight, testId }) => (
  <div className={`metric-card ${highlight ? 'highlight' : ''}`} data-testid={testId}>
    <div className="metric-icon">{icon}</div>
    <span className="metric-label">{label}</span>
    <span className="metric-value">{value}</span>
    <span className="metric-sublabel">{sublabel}</span>
  </div>
);

export default App;
