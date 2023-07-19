import { createClient } from '@rspc/client'
import { TauriTransport } from '@rspc/tauri'

import type { Procedures } from '../rspc-bindings'

export const useRSPC = () => {
  const client = createClient<Procedures>({
    transport: new TauriTransport(),
  })

  return { client }
}
