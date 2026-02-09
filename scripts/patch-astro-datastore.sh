#!/bin/bash
# Patch Astro's MutableDataStore to swallow ENOENT race conditions.
# The dev server's file watcher triggers concurrent writes; the atomic
# write-tmp-then-rename pattern races and the .tmp file can vanish
# between writeFile and rename. This patch catches ENOENT at every level.
FILE="node_modules/astro/dist/content/mutable-data-store.js"
if [ -f "$FILE" ]; then
  if grep -q "ENOENT" "$FILE"; then
    echo "Already patched"
    exit 0
  fi

  # Replace the try/finally in #writeFileAtomic with try/catch/finally
  # that swallows ENOENT from both writeFile and rename
  sed -i.bak \
    's/await fs.rename(tempFile, filePath);/await fs.rename(tempFile, filePath);} catch (e) { if (e.code !== '\''ENOENT'\'') throw e;/' \
    "$FILE"

  # Also guard writeToDisk's catch block
  sed -i.bak \
    's/} catch (err) {$/} catch (err) { if (err?.code === '\''ENOENT'\'') return;/' \
    "$FILE"

  rm -f "$FILE.bak"
  echo "Patched Astro data store ENOENT races"
fi
