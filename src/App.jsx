import React, { useState, useEffect } from 'react'
import { piecesInitiales } from './data/list'
import logoAfafi from './assets/afafi.jpg'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome, faFileImport, faInfoCircle, faSync,
  faTimes, faBars, faArrowLeft, faExchangeAlt,
  faSearchPlus, faSearchMinus, faMoon, faSun, 
  faStickyNote, faEdit, faTrash, faCheck
} from '@fortawesome/free-solid-svg-icons'

function App() {
  const [bibliotheque, setBibliotheque] = useState([])
  const [scriptData, setScriptData] = useState(null)
  const [monRole, setMonRole] = useState(null)
  const [acteIndex, setActeIndex] = useState(0)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [vueApropos, setVueApropos] = useState(false)
  const [fontSize, setFontSize] = useState(17)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theatre_theme') === 'dark')

  // STRUCTURE DES NOTES : { "Titre": { "Acte_Index": { "Dialogue_Index": "Ma note" } } }
  const [notesContextuelles, setNotesContextuelles] = useState(() => {
    const sauve = localStorage.getItem('theatre_notes_v2')
    return sauve ? JSON.parse(sauve) : {}
  })

  useEffect(() => {
    const sauvegarde = localStorage.getItem('theatre_db')
    if (sauvegarde && sauvegarde !== "[]") {
      setBibliotheque(JSON.parse(sauvegarde))
    } else {
      setBibliotheque(piecesInitiales)
      localStorage.setItem('theatre_db', JSON.stringify(piecesInitiales))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theatre_theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const actualiserBibliotheque = () => {
    setBibliotheque(piecesInitiales)
    localStorage.setItem('theatre_db', JSON.stringify(piecesInitiales))
    setMenuOuvert(false)
    alert("🔄 Bibliothèque actualisée !")
  }

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  const sauvegarderNote = (titre, acteIdx, dialIdx, texte) => {
    const nouvelles = { ...notesContextuelles }
    if (!nouvelles[titre]) nouvelles[titre] = {}
    if (!nouvelles[titre][acteIdx]) nouvelles[titre][acteIdx] = {}
    
    if (texte === null) {
      delete nouvelles[titre][acteIdx][dialIdx]
    } else {
      nouvelles[titre][acteIdx][dialIdx] = texte
    }
    
    setNotesContextuelles(nouvelles)
    localStorage.setItem('theatre_notes_v2', JSON.stringify(nouvelles))
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const nouveau = JSON.parse(e.target.result)
          const maj = [...bibliotheque, nouveau]
          setBibliotheque(maj)
          localStorage.setItem('theatre_db', JSON.stringify(maj))
          setMenuOuvert(false)
        } catch (err) { alert("❌ Erreur JSON") }
      }
      reader.readAsText(file)
    }
  }

  const theme = {
    bg: isDarkMode ? '#121212' : '#f4f7f6',
    surface: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#e0e0e0' : '#1e3a5f',
    nav: isDarkMode ? '#000000' : '#1e3a5f',
    card: isDarkMode ? '#2c2c2c' : '#ffffff',
    border: isDarkMode ? '#333333' : '#f1f3f5',
    lineMe: isDarkMode ? '#3d3d29' : '#fff9c4', 
    textMe: isDarkMode ? '#ffd54f' : '#1e3a5f',
    noteAccent: isDarkMode ? '#ffd54f' : '#1e3a5f'
  }

  return (
    <div style={{ ...styles.appContainer, backgroundColor: theme.bg }}>
      {menuOuvert && (
        <div style={{ ...styles.sidebar, backgroundColor: theme.surface }}>
          <button onClick={() => setMenuOuvert(false)} style={{ ...styles.btnClose, backgroundColor: theme.border, color: theme.text }}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div style={styles.menuItems}>
            <div onClick={() => {setScriptData(null); setMonRole(null); setMenuOuvert(false)}} style={{ ...styles.menuLink, color: theme.text, borderBottomColor: theme.border }}>
              <FontAwesomeIcon icon={faHome} style={styles.menuIcon} /> Accueil
            </div>
            <div onClick={toggleTheme} style={{ ...styles.menuLink, color: theme.text, borderBottomColor: theme.border }}>
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} style={styles.menuIcon} /> Mode {isDarkMode ? 'Clair' : 'Nuit'}
            </div>
            <div onClick={actualiserBibliotheque} style={{ ...styles.menuLink, color: theme.text, borderBottomColor: theme.border }}>
              <FontAwesomeIcon icon={faSync} style={styles.menuIcon} /> Actualiser
            </div>
          </div>
        </div>
      )}

      <div style={{ ...styles.navbar, backgroundColor: theme.nav }}>
        <button onClick={() => setMenuOuvert(true)} style={styles.burgerBtn}><FontAwesomeIcon icon={faBars} /></button>
        <div style={styles.navTitle}>TANTARA AFAFI</div>
      </div>

      <div style={styles.content}>
        {!scriptData ? (
          <div style={styles.section}>
            <h3 style={{ color: theme.text }}>📂 LISITR'IREO TANTARA</h3>
            {bibliotheque.map((piece, i) => (
              <div key={i} onClick={() => setScriptData(piece)} style={{ ...styles.cardPiece, backgroundColor: theme.card, color: theme.text }}>
                <i>{piece.titre}</i>
                <span style={{ ...styles.badge, backgroundColor: theme.border }}>{(piece.actes || piece.acte)?.length} Actes</span>
              </div>
            ))}
          </div>
        ) : !monRole ? (
          <div style={styles.section}>
            <h2 style={{ color: theme.text }}>{scriptData.titre}</h2>
            <div style={styles.gridRoles}>
              {scriptData.personnages.filter(p => p.toUpperCase() !== "SCÈNE").map(p => (
                <button key={p} onClick={() => setMonRole(p)} style={{ ...styles.btnRole, backgroundColor: theme.card, color: theme.text, borderColor: theme.text }}>{p}</button>
              ))}
            </div>
          </div>
        ) : (
          <LectureView
            acte={(scriptData.actes || scriptData.acte)[acteIndex]}
            acteIdx={acteIndex}
            role={monRole}
            fontSize={fontSize}
            setFontSize={setFontSize}
            onNext={() => setActeIndex(acteIndex + 1)}
            onPrev={() => setActeIndex(acteIndex - 1)}
            isLast={acteIndex === (scriptData.actes || scriptData.acte).length - 1}
            isFirst={acteIndex === 0}
            quitter={() => setMonRole(null)}
            theme={theme}
            isDarkMode={isDarkMode}
            titrePiece={scriptData.titre}
            notesPiece={notesContextuelles[scriptData.titre]?.[acteIndex] || {}}
            onSaveNote={sauvegarderNote}
          />
        )}
      </div>
    </div>
  )
}

const LectureView = ({ acte, acteIdx, role, fontSize, setFontSize, onNext, onPrev, isLast, isFirst, quitter, theme, isDarkMode, titrePiece, notesPiece, onSaveNote }) => {
  const [editIdx, setEditIdx] = useState(null)
  const [tempNote, setTempNote] = useState("")

  const startEdit = (idx, currentNote) => {
    setEditIdx(idx)
    setTempNote(currentNote || "")
  }

  const confirmSave = (idx) => {
    onSaveNote(titrePiece, acteIdx, idx, tempNote)
    setEditIdx(null)
  }

  return (
    <div style={{ ...styles.readContainer, backgroundColor: theme.surface }}>
      <div style={{ ...styles.readHeader, borderBottomColor: theme.border }}>
        <span style={{ fontWeight: 'bold', color: theme.text }}>{acte.lieu}</span>
        <div style={styles.zoomGroup}>
          <FontAwesomeIcon icon={faSearchMinus} onClick={() => setFontSize(Math.max(12, fontSize - 2))} style={{ color: theme.text }} />
          <FontAwesomeIcon icon={faSearchPlus} onClick={() => setFontSize(Math.min(32, fontSize + 2))} style={{ color: theme.text }} />
          <FontAwesomeIcon icon={faExchangeAlt} onClick={quitter} style={{ color: theme.text, marginLeft: '10px' }} />
        </div>
      </div>

      <div style={styles.scrollArea}>
        {acte.dialogues.map((d, i) => {
          const isMe = d.perso === role;
          const isScene = d.perso?.toUpperCase() === "SCÈNE";
          const noteExistante = notesPiece[i];

          if (isScene) return <div key={i} style={styles.instructionScene}>{d.texte}</div>

          return (
            <div key={i} style={{
              ...styles.line,
              backgroundColor: isMe ? theme.lineMe : theme.card,
              borderRight: isMe ? `6px solid ${theme.noteAccent}` : 'none',
              borderLeft: isMe ? 'none' : `6px solid ${isDarkMode ? '#444' : '#ccc'}`,
              position: 'relative'
            }}>
              <small style={{ fontWeight: 'bold', color: isMe ? theme.textMe : (isDarkMode ? '#aaa' : '#555'), display: 'block' }}>{d.perso}</small>
              <p style={{ margin: '5px 0', fontSize: `${fontSize}px`, color: isDarkMode ? '#e0e0e0' : '#1a1a1a' }}>{d.texte}</p>

              {/* AFFICHAGE DE LA NOTE SI ELLE EXISTE */}
              {noteExistante && editIdx !== i && (
                <div style={{ ...styles.noteDisplay, color: theme.noteAccent }}>
                  <FontAwesomeIcon icon={faStickyNote} style={{ marginRight: '5px' }} />
                  {noteExistante}
                </div>
              )}

              {/* ZONE D'ÉDITION */}
              {editIdx === i && (
                <div style={styles.editArea}>
                  <textarea 
                    autoFocus
                    value={tempNote} 
                    onChange={(e) => setTempNote(e.target.value)}
                    style={{ ...styles.textarea, backgroundColor: isDarkMode ? '#000' : '#fff', color: theme.text }}
                  />
                  <button onClick={() => confirmSave(i)} style={styles.btnAction}><FontAwesomeIcon icon={faCheck} /></button>
                </div>
              )}

              {/* BOUTONS D'ACTION (En bas à droite) */}
              {(isMe || isScene) && (
                <div style={styles.actionContainer}>
                  {editIdx !== i && (
                    <>
                      {!noteExistante ? (
                        <FontAwesomeIcon icon={faStickyNote} onClick={() => startEdit(i, "")} style={styles.iconBtn} />
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faEdit} onClick={() => startEdit(i, noteExistante)} style={styles.iconBtn} />
                          <FontAwesomeIcon icon={faTrash} onClick={() => onSaveNote(titrePiece, acteIdx, i, null)} style={{ ...styles.iconBtn, color: '#ff5252' }} />
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={styles.footer}>
        <button disabled={isFirst} onClick={onPrev} style={{ ...styles.btnNav, opacity: isFirst ? 0.5 : 1 }}>Précédent</button>
        <button disabled={isLast} onClick={onNext} style={{ ...styles.btnNav, opacity: isLast ? 0.5 : 1 }}>Suivant</button>
      </div>
    </div>
  )
}

const styles = {
  appContainer: { height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' },
  navbar: { height: '60px', color: 'white', display: 'flex', alignItems: 'center', padding: '0 15px' },
  burgerBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px' },
  navTitle: { marginLeft: '15px', fontWeight: 'bold' },
  sidebar: { position: 'absolute', width: '280px', height: '100%', zIndex: 100, padding: '20px' },
  menuItems: { marginTop: '40px' },
  menuLink: { padding: '15px 0', borderBottom: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  menuIcon: { marginRight: '15px' },
  btnClose: { alignSelf: 'flex-end', padding: '10px' },
  content: { flex: 1, overflowY: 'auto' },
  section: { padding: '20px' },
  cardPiece: { padding: '15px', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' },
  badge: { padding: '2px 8px', borderRadius: '10px', fontSize: '11px' },
  gridRoles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  btnRole: { padding: '15px', borderRadius: '10px', border: '1px solid' },
  readContainer: { height: '100%', display: 'flex', flexDirection: 'column' },
  readHeader: { padding: '10px 15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid' },
  zoomGroup: { display: 'flex', gap: '15px', alignItems: 'center' },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '15px' },
  instructionScene: { padding: '15px', margin: '15px 0', textAlign: 'center', fontStyle: 'italic', color: '#888' },
  line: { padding: '12px', margin: '15px 0', borderRadius: '8px' },
  actionContainer: { position: 'absolute', bottom: '5px', right: '10px', display: 'flex', gap: '12px' },
  iconBtn: { cursor: 'pointer', opacity: 0.6, fontSize: '16px' },
  noteDisplay: { marginTop: '8px', fontSize: '13px', fontStyle: 'italic', fontWeight: 'bold' },
  editArea: { marginTop: '10px', display: 'flex', gap: '5px' },
  textarea: { flex: 1, borderRadius: '5px', padding: '8px', border: '1px solid #ccc', fontSize: '14px' },
  btnAction: { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#4caf50', color: 'white' },
  footer: { padding: '15px', display: 'flex', gap: '10px' },
  btnNav: { flex: 1, padding: '16px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', borderRadius: '12px' }
}

export default App