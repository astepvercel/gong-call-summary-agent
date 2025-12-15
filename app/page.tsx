/**
 * Status / Documentation Page
 *
 * Provides a simple landing page with setup instructions
 * and configuration status.
 */

import { validateConfig, config } from '@/lib/config';

export default function HomePage() {
  const configStatus = validateConfig();

  return (
    <main
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1>Gong Call Summary Agent</h1>

      <p>
        AI-powered call summary agent that processes Gong webhooks and generates
        structured summaries using Vercel Sandbox.
      </p>

      <h2>Status</h2>

      <div
        style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: configStatus.valid ? '#d4edda' : '#f8d7da',
          marginBottom: '20px',
        }}
      >
        <strong>Configuration: </strong>
        {configStatus.valid ? (
          <span style={{ color: '#155724' }}>[Valid]</span>
        ) : (
          <span style={{ color: '#721c24' }}>
            [Invalid] - {configStatus.errors.join(', ')}
          </span>
        )}
      </div>

      <h2>Integrations</h2>

      <ul>
        <li>
          <strong>Gong API:</strong>{' '}
          {config.gong.accessKey ? '[Configured]' : '[Not configured]'}
        </li>
        <li>
          <strong>Slack:</strong>{' '}
          {config.slack.enabled ? '[Enabled]' : '[Disabled] (optional)'}
        </li>
        <li>
          <strong>Salesforce:</strong>{' '}
          {config.salesforce.enabled ? '[Enabled]' : '[Disabled] (optional)'}
        </li>
      </ul>

      <h2>Webhook Endpoint</h2>

      <p>
        Configure your Gong webhook to POST to:
        <br />
        <code
          style={{
            backgroundColor: '#f4f4f4',
            padding: '8px 12px',
            borderRadius: '4px',
            display: 'inline-block',
            marginTop: '8px',
          }}
        >
          https://your-domain.vercel.app/api/gong-webhook
        </code>
      </p>

      <h2>Quick Start</h2>

      <ol>
        <li>Set required environment variables (GONG_ACCESS_KEY, GONG_SECRET_KEY, ANTHROPIC_API_KEY)</li>
        <li>Deploy to Vercel</li>
        <li>Configure Gong webhook to point to your deployment</li>
        <li>(Optional) Configure Slack for notifications</li>
      </ol>

      <h2>Documentation</h2>

      <p>
        See the{' '}
        <a
          href="https://github.com/your-org/gong-call-summary-agent"
          target="_blank"
          rel="noopener noreferrer"
        >
          README
        </a>{' '}
        for full documentation.
      </p>
    </main>
  );
}
