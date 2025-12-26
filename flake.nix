{
  description = "Abby Node.js SDK development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js LTS
            nodejs_22
            
            # pnpm package manager
            pnpm
            
            # Bun runtime
            bun
            
            # Deno runtime
            deno
            
            # Useful tools
            jq
          ];

          shellHook = ''
            echo "🚀 Abby Node.js SDK development environment"
            echo "   Node.js: $(node --version)"
            echo "   pnpm: $(pnpm --version)"
            echo "   Bun: $(bun --version)"
            echo "   Deno: $(deno --version | head -1)"
          '';
        };
      }
    );
}

