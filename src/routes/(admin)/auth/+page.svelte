<script lang="ts">
	import { supabase } from '$lib/supabaseClient'
	import { goto } from '$app/navigation'
	let email = ''
	let password = ''
	let error: string | null = null
	let message

	const handleLogin = async () => {
		const { data, error: loginError } = await supabase.auth.signInWithPassword({
			email,
			password
		})

		if (loginError) {
			error = loginError.message
		} else {
			// Force a full reload to refresh hooks and session
			location.href = '/admin'
		}
	}

	async function getUser() {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        message = error.message
      } else {
        message = `User: ${JSON.stringify(data.user)}`
      }
    }

</script>

<form on:submit|preventDefault={handleLogin}>
	<input type="email" bind:value={email} placeholder="Email" required />
	<input type="password" bind:value={password} placeholder="Password" required />
	<button type="submit">Login</button>
  <button on:click={getUser}>Who is signed in</button>

  <p>{message}</p>

</form>

{#if error}
	<p style="color:red">{error}</p>
{/if}
