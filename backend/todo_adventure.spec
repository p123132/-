import sys
import os

spec_dir = os.path.dirname(sys.argv[0])
block_cipher = None

a = Analysis(
    ['pack_entry.py'],
    pathex=[spec_dir],
    binaries=[],
    datas=[
        ('frontend_dist', 'frontend_dist'),
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'bcrypt',
        'jwt',
        'sqlite3',
        'uuid',
        'datetime',
        'threading',
        'webbrowser',
        'time',
        'os',
        'sys',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='TodoAdventure',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)