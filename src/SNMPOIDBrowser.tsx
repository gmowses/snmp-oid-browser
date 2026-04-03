import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Search, Terminal, ChevronRight, ChevronDown } from 'lucide-react'

const translations = {
  en: {
    title: 'SNMP OID Browser',
    subtitle: 'Browse MIB-II OID tree, search by name or OID, and get ready-to-use snmpwalk commands. RFC 1213, 2863.',
    search: 'Search OID name or number...',
    tree: 'MIB-II Tree',
    treeDesc: 'Click to expand groups',
    details: 'OID Details',
    oid: 'OID', name: 'Name', type: 'Type', access: 'Access', description: 'Description',
    commands: 'snmpwalk Commands',
    commandsDesc: 'Replace TARGET, COMMUNITY, VERSION as needed',
    noSelection: 'Select an OID from the tree to see details.',
    rfcNote: 'RFC 1213 (MIB-II), RFC 2863 (IF-MIB), RFC 1157 (SNMP), RFC 3411 (SNMPv3)',
    builtBy: 'Built by',
    readOnly: 'read-only',
    readWrite: 'read-write',
    notAccessible: 'not-accessible',
  },
  pt: {
    title: 'Browser de OIDs SNMP',
    subtitle: 'Navegue na arvore MIB-II, busque por nome ou OID e obtenha comandos snmpwalk prontos. RFC 1213, 2863.',
    search: 'Buscar nome ou numero OID...',
    tree: 'Arvore MIB-II',
    treeDesc: 'Clique para expandir grupos',
    details: 'Detalhes do OID',
    oid: 'OID', name: 'Nome', type: 'Tipo', access: 'Acesso', description: 'Descricao',
    commands: 'Comandos snmpwalk',
    commandsDesc: 'Substitua TARGET, COMMUNITY, VERSION conforme necessario',
    noSelection: 'Selecione um OID da arvore para ver os detalhes.',
    rfcNote: 'RFC 1213 (MIB-II), RFC 2863 (IF-MIB), RFC 1157 (SNMP), RFC 3411 (SNMPv3)',
    builtBy: 'Criado por',
    readOnly: 'somente-leitura',
    readWrite: 'leitura-escrita',
    notAccessible: 'nao-acessivel',
  },
} as const

type Lang = keyof typeof translations

interface OIDEntry {
  oid: string
  name: string
  type: string
  access: string
  description: string
  group: string
}

const OID_DATA: OIDEntry[] = [
  // system
  { oid: '.1.3.6.1.2.1.1', name: 'system', type: 'GROUP', access: 'not-accessible', description: 'System group. Contains information about the device itself.', group: 'system' },
  { oid: '.1.3.6.1.2.1.1.1.0', name: 'sysDescr', type: 'DisplayString', access: 'read-only', description: 'Textual description of the entity. Must include hardware, OS, software version.', group: 'system' },
  { oid: '.1.3.6.1.2.1.1.2.0', name: 'sysObjectID', type: 'OBJECT IDENTIFIER', access: 'read-only', description: 'OID identifying vendor product. Enterprise OID sub-tree.', group: 'system' },
  { oid: '.1.3.6.1.2.1.1.3.0', name: 'sysUpTime', type: 'TimeTicks', access: 'read-only', description: 'Time since network management reinitializated. In hundredths of a second.', group: 'system' },
  { oid: '.1.3.6.1.2.1.1.4.0', name: 'sysContact', type: 'DisplayString', access: 'read-write', description: 'Contact person for this managed node. Includes phone/email.', group: 'system' },
  { oid: '.1.3.6.1.2.1.1.5.0', name: 'sysName', type: 'DisplayString', access: 'read-write', description: 'Administratively-assigned hostname. Fully qualified domain name.', group: 'system' },
  { oid: '.1.3.6.1.2.1.1.6.0', name: 'sysLocation', type: 'DisplayString', access: 'read-write', description: 'Physical location of this node. E.g., "POP SP - Rack 3A".', group: 'system' },
  // interfaces
  { oid: '.1.3.6.1.2.1.2', name: 'interfaces', type: 'GROUP', access: 'not-accessible', description: 'Interfaces group. Basic interface information.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.1.0', name: 'ifNumber', type: 'Integer32', access: 'read-only', description: 'Number of network interfaces present on this system.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.1', name: 'ifIndex', type: 'InterfaceIndex', access: 'read-only', description: 'Interface index. Unique per interface within a managed system.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.2', name: 'ifDescr', type: 'DisplayString', access: 'read-only', description: 'Interface description. Contains port name, e.g., "GigabitEthernet0/0/1".', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.5', name: 'ifSpeed', type: 'Gauge32', access: 'read-only', description: 'Interface nominal bandwidth in bits/second. Max 4.29 Gbps (32-bit).', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.7', name: 'ifAdminStatus', type: 'INTEGER', access: 'read-write', description: 'Desired state: 1=up, 2=down, 3=testing. Can be set to admin up/down.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.8', name: 'ifOperStatus', type: 'INTEGER', access: 'read-only', description: 'Current operational state: 1=up, 2=down, 3=testing, 5=dormant, 7=lowerLayerDown.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.10', name: 'ifInOctets', type: 'Counter32', access: 'read-only', description: 'Total octets received on interface. 32-bit, wraps at ~4GB. Use ifHCInOctets for 10G+.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.16', name: 'ifOutOctets', type: 'Counter32', access: 'read-only', description: 'Total octets sent on interface. 32-bit counter, wraps frequently on high-speed links.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.14', name: 'ifInErrors', type: 'Counter32', access: 'read-only', description: 'Inbound packets with errors. Key health metric for fiber/copper links.', group: 'interfaces' },
  { oid: '.1.3.6.1.2.1.2.2.1.20', name: 'ifOutErrors', type: 'Counter32', access: 'read-only', description: 'Outbound packets not transmitted due to errors.', group: 'interfaces' },
  // ifMIB (IF-MIB RFC 2863) - 64bit counters
  { oid: '.1.3.6.1.2.1.31.1.1.1', name: 'ifXTable', type: 'TABLE', access: 'not-accessible', description: 'Extended interface table. 64-bit counters. RFC 2863. Essential for 10G+ interfaces.', group: 'ifMIB' },
  { oid: '.1.3.6.1.2.1.31.1.1.1.1', name: 'ifName', type: 'DisplayString', access: 'read-only', description: 'Short interface name. Often different from ifDescr. E.g., "Gi0/1" vs full name.', group: 'ifMIB' },
  { oid: '.1.3.6.1.2.1.31.1.1.1.6', name: 'ifHCInOctets', type: 'Counter64', access: 'read-only', description: '64-bit incoming octets counter. Required for 1G+ links to avoid counter wrap. RFC 2863.', group: 'ifMIB' },
  { oid: '.1.3.6.1.2.1.31.1.1.1.10', name: 'ifHCOutOctets', type: 'Counter64', access: 'read-only', description: '64-bit outgoing octets counter. Use this for all high-speed interface monitoring.', group: 'ifMIB' },
  { oid: '.1.3.6.1.2.1.31.1.1.1.15', name: 'ifHighSpeed', type: 'Gauge32', access: 'read-only', description: 'Interface speed in Mbps. Avoids ifSpeed 32-bit limitation. Use for 10G+ interfaces.', group: 'ifMIB' },
  // ip
  { oid: '.1.3.6.1.2.1.4', name: 'ip', type: 'GROUP', access: 'not-accessible', description: 'IP group. IP layer statistics and routing tables.', group: 'ip' },
  { oid: '.1.3.6.1.2.1.4.1.0', name: 'ipForwarding', type: 'INTEGER', access: 'read-write', description: 'Whether entity is forwarding IP datagrams: 1=forwarding (router), 2=not-forwarding (host).', group: 'ip' },
  { oid: '.1.3.6.1.2.1.4.3.0', name: 'ipInReceives', type: 'Counter32', access: 'read-only', description: 'Total input datagrams received from all interfaces including in error.', group: 'ip' },
  { oid: '.1.3.6.1.2.1.4.10.0', name: 'ipInDelivers', type: 'Counter32', access: 'read-only', description: 'Datagrams successfully delivered to IP user-protocols (TCP, UDP, ICMP, etc.).', group: 'ip' },
  // icmp
  { oid: '.1.3.6.1.2.1.5', name: 'icmp', type: 'GROUP', access: 'not-accessible', description: 'ICMP group. ICMP message statistics.', group: 'icmp' },
  { oid: '.1.3.6.1.2.1.5.1.0', name: 'icmpInMsgs', type: 'Counter32', access: 'read-only', description: 'Total ICMP messages received including those with errors.', group: 'icmp' },
  { oid: '.1.3.6.1.2.1.5.8.0', name: 'icmpInEchos', type: 'Counter32', access: 'read-only', description: 'ICMP Echo Request messages received. Useful for detecting ping floods.', group: 'icmp' },
  // tcp
  { oid: '.1.3.6.1.2.1.6', name: 'tcp', type: 'GROUP', access: 'not-accessible', description: 'TCP group. TCP connection statistics.', group: 'tcp' },
  { oid: '.1.3.6.1.2.1.6.9.0', name: 'tcpCurrEstab', type: 'Gauge32', access: 'read-only', description: 'Number of TCP connections in ESTABLISHED or CLOSE-WAIT state. Real-time connection count.', group: 'tcp' },
  { oid: '.1.3.6.1.2.1.6.10.0', name: 'tcpInSegs', type: 'Counter32', access: 'read-only', description: 'Total TCP segments received including those with errors.', group: 'tcp' },
  { oid: '.1.3.6.1.2.1.6.12.0', name: 'tcpRetransSegs', type: 'Counter32', access: 'read-only', description: 'TCP segments retransmitted. Elevated value indicates network quality issues.', group: 'tcp' },
  // udp
  { oid: '.1.3.6.1.2.1.7', name: 'udp', type: 'GROUP', access: 'not-accessible', description: 'UDP group. UDP datagram statistics.', group: 'udp' },
  { oid: '.1.3.6.1.2.1.7.1.0', name: 'udpInDatagrams', type: 'Counter32', access: 'read-only', description: 'UDP datagrams delivered to UDP users.', group: 'udp' },
  { oid: '.1.3.6.1.2.1.7.2.0', name: 'udpNoPorts', type: 'Counter32', access: 'read-only', description: 'UDP datagrams for which no application at destination port. ICMP Port Unreachable sent.', group: 'udp' },
  // snmp
  { oid: '.1.3.6.1.2.1.11', name: 'snmp', type: 'GROUP', access: 'not-accessible', description: 'SNMP group. SNMP protocol statistics for this agent.', group: 'snmp' },
  { oid: '.1.3.6.1.2.1.11.1.0', name: 'snmpInPkts', type: 'Counter32', access: 'read-only', description: 'Total SNMP messages received by the agent.', group: 'snmp' },
  { oid: '.1.3.6.1.2.1.11.30.0', name: 'snmpEnableAuthenTraps', type: 'INTEGER', access: 'read-write', description: 'Whether agent sends authenticationFailure traps: 1=enabled, 2=disabled.', group: 'snmp' },
]

const GROUPS = ['system', 'interfaces', 'ifMIB', 'ip', 'icmp', 'tcp', 'udp', 'snmp']
const GROUP_COLORS: Record<string, string> = {
  system: '#22c55e', interfaces: '#3b82f6', ifMIB: '#0ea5e9', ip: '#8b5cf6',
  icmp: '#f59e0b', tcp: '#ef4444', udp: '#f97316', snmp: '#14b8a6',
}

export default function SNMPOIDBrowser() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<OIDEntry | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['system', 'interfaces', 'ifMIB']))

  const t = translations[lang]

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const filteredOids = search
    ? OID_DATA.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.oid.includes(search))
    : null

  const toggle = (g: string) => setExpanded(ex => { const n = new Set(ex); n.has(g) ? n.delete(g) : n.add(g); return n })

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Terminal size={18} className="text-white" />
            </div>
            <span className="font-semibold">SNMP OID Browser</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/snmp-oid-browser" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Tree */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-1">
              <div className="mb-3">
                <h2 className="font-semibold text-sm">{t.tree}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.treeDesc}</p>
              </div>
              {filteredOids ? (
                filteredOids.map(o => (
                  <button
                    key={o.oid}
                    onClick={() => setSelected(o)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${selected?.oid === o.oid ? 'bg-green-50 dark:bg-green-950/30' : ''}`}
                  >
                    <div className="font-mono font-semibold text-green-600 dark:text-green-400">{o.name}</div>
                    <div className="text-zinc-400 font-mono text-[10px]">{o.oid}</div>
                  </button>
                ))
              ) : (
                GROUPS.map(group => {
                  const groupOids = OID_DATA.filter(o => o.group === group)
                  const isExpanded = expanded.has(group)
                  return (
                    <div key={group}>
                      <button
                        onClick={() => toggle(group)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {isExpanded ? <ChevronDown size={12} className="text-zinc-400" /> : <ChevronRight size={12} className="text-zinc-400" />}
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: GROUP_COLORS[group] }} />
                        <span className="text-sm font-semibold">{group}</span>
                        <span className="ml-auto text-[10px] text-zinc-400">{groupOids.length}</span>
                      </button>
                      {isExpanded && groupOids.map(o => (
                        <button
                          key={o.oid}
                          onClick={() => setSelected(o)}
                          className={`w-full text-left pl-8 pr-3 py-1.5 rounded-lg text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${selected?.oid === o.oid ? 'bg-green-50 dark:bg-green-950/30' : ''}`}
                        >
                          <div className="font-mono font-semibold" style={{ color: GROUP_COLORS[group] }}>{o.name}</div>
                          <div className="text-zinc-400 font-mono text-[10px]">{o.oid}</div>
                        </button>
                      ))}
                    </div>
                  )
                })
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <h2 className="font-semibold mb-3">{t.details}</h2>
                {selected ? (
                  <div className="space-y-3">
                    {[
                      { label: t.oid, value: selected.oid, mono: true },
                      { label: t.name, value: selected.name, mono: true },
                      { label: t.type, value: selected.type, mono: false },
                      { label: t.access, value: selected.access, mono: false },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="flex gap-3">
                        <span className="text-xs font-medium text-zinc-400 w-24 shrink-0 pt-0.5">{label}</span>
                        <span className={`text-sm ${mono ? 'font-mono text-green-600 dark:text-green-400' : ''}`}>{value}</span>
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <span className="text-xs font-medium text-zinc-400 w-24 shrink-0 pt-0.5">{t.description}</span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{selected.description}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 italic">{t.noSelection}</p>
                )}
              </div>

              {selected && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                  <h2 className="font-semibold mb-1">{t.commands}</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{t.commandsDesc}</p>
                  <div className="space-y-2">
                    {[
                      `snmpget -v2c -c COMMUNITY TARGET "${selected.oid}"`,
                      `snmpwalk -v2c -c COMMUNITY TARGET "${selected.oid}"`,
                      `snmpget -v3 -l authPriv -u USER -a SHA -A AUTHPASS -x AES -X PRIVPASS TARGET "${selected.oid}"`,
                    ].map((cmd, i) => (
                      <div key={i} className="rounded-lg bg-zinc-950 dark:bg-black px-4 py-3 font-mono text-xs text-green-400 overflow-x-auto">
                        {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-zinc-400">{t.rfcNote}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-green-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
