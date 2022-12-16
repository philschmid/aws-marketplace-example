import hashlib
from jose import jwe
from numpy import array
from hkdf import Hkdf

token = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..NvcfxZ04ybSuDlBo.TXm6spe3pT3z8yL6Iv_ZE_QAA09UFUp3k4R6bn43gO6cZ24RTFsbu2biie6BRqCQqg6IvQbpPEEtdNxQJ3TNKfY3GIw8l9k3EMicx0sVzFd8RuxhXhqbLZ0aSEQDi2_b31WtRZWc8cNtBNL0EKK1n22_QAOIqdgHx5rF0v06HQG_VdPfHN2w7sfm0WaejYi66LTX9nzQeLRkRk_2d9xblo1J5sV3P27HWpD99K5bVBbpFgrIjAjTVDf2_9Y4p6HFsbg7fmO9e3bO7i4Ehnelkp9hdGH1ddHMv-ARBqihELHnL1x4mCxbOPEIbUr9uYLD0j9nSny7187W2L2vRpegeHh5sUoaTWsOCOk3evkOkFaLu4rnTl9vLxTSK4i7KklIQFwYy7sDFJ4ke_CeS2FQZ9Nwyz-XdkBKOh1zMiyt5w.VtkvU-Jc2Dpwy5GDmor4GA"

raw_secret = "6ccdc16453ee9ed9d38c72f8ef5354aa"
py = Hkdf(salt="", input_key_material=raw_secret.encode(), hash=hashlib.sha256).expand(
    info="NextAuth.js Generated Encryption Key".encode(), length=32
)

print(py)
print(jwe.decrypt(token, py))
